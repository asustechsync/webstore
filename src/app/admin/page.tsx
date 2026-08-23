import Link from "next/link";
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import styles from "./admin.module.css";

// Mismo criterio que en Reportes: solo estos estados cuentan como venta real.
const ESTADOS_VENTA = ["PAGADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO"] as const;
// Un pedido en estos estados todavía necesita que alguien lo mueva.
const ESTADOS_PENDIENTES = ["PENDIENTE", "PAGADO"] as const;

function inicioDeHoy() {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

function haceDias(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

function diasDesde(fecha: Date) {
  return Math.floor((new Date().getTime() - fecha.getTime()) / 86_400_000);
}

function variacion(actual: number, anterior: number) {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return Math.round(((actual - anterior) / anterior) * 100);
}

// Puntos de un <polyline> a partir de una serie de números, sin librería.
function puntosSparkline(valores: number[]) {
  const maximo = Math.max(...valores, 1);
  const paso = 100 / (valores.length - 1 || 1);
  return valores
    .map((valor, indice) => `${indice * paso},${24 - (valor / maximo) * 20 - 2}`)
    .join(" ");
}

export default async function AdminDashboardPage() {
  const hoy = inicioDeHoy();
  const hace7Dias = haceDias(7);
  const hace14Dias = haceDias(14);
  const en7Dias = new Date();
  en7Dias.setDate(en7Dias.getDate() + 7);

  const [
    pedidosPendientes,
    variantesActivas,
    cuponesPorVencer,
    pedidosSemana,
    pedidosSemanaAnterior,
    ultimosPedidos,
    ultimosUsuarios,
  ] = await Promise.all([
    db.pedido.findMany({
      where: { estado: { in: [...ESTADOS_PENDIENTES] } },
      orderBy: { creadoEn: "asc" }, // los más antiguos primero: son los más urgentes
      take: 5,
      include: { usuario: { select: { email: true } } },
    }),
    // Prisma no compara dos columnas en un where (cantidad vs. stockMinimo),
    // así que se filtra en memoria — igual que en /admin/productos.
    db.variante.findMany({
      where: { activo: true },
      orderBy: { cantidad: "asc" },
      include: { producto: { select: { nombre: true } } },
    }),
    db.cupon.findMany({
      where: { activo: true, fechaFin: { gte: new Date(), lte: en7Dias } },
      orderBy: { fechaFin: "asc" },
      take: 5,
    }),
    // Solo lo mínimo para calcular ventas/pedidos de hoy y de la semana, y
    // sus mini-ondas: el detalle por producto/cliente vive en /admin/reportes.
    db.pedido.findMany({
      where: { estado: { in: [...ESTADOS_VENTA] }, creadoEn: { gte: hace7Dias } },
      select: { total: true, creadoEn: true },
    }),
    db.pedido.aggregate({
      where: {
        estado: { in: [...ESTADOS_VENTA] },
        creadoEn: { gte: hace14Dias, lt: hace7Dias },
      },
      _sum: { total: true },
      _count: true,
    }),
    db.pedido.findMany({
      orderBy: { creadoEn: "desc" },
      take: 8,
      include: { usuario: { select: { email: true } } },
    }),
    db.usuario.findMany({ orderBy: { creadoEn: "desc" }, take: 5 }),
  ]);

  const variantesBajas = variantesActivas
    .filter((variante) => variante.cantidad <= variante.stockMinimo)
    .slice(0, 5);

  // Top productos de la semana se calcula en memoria (igual que en Reportes):
  // el ingreso por línea es cantidad × precioUnit, algo que Prisma no suma directo.
  const itemsSemana = await db.itemPedido.findMany({
    where: {
      pedido: { estado: { in: [...ESTADOS_VENTA] }, creadoEn: { gte: hace7Dias } },
    },
    include: { variante: { include: { producto: { select: { id: true, nombre: true } } } } },
  });

  const porProducto = new Map<string, { nombre: string; unidades: number }>();
  for (const item of itemsSemana) {
    const producto = item.variante.producto;
    const actual = porProducto.get(producto.id) ?? { nombre: producto.nombre, unidades: 0 };
    actual.unidades += item.cantidad;
    porProducto.set(producto.id, actual);
  }
  const topProductosSemana = [...porProducto.values()]
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 5);

  // Ventas y pedidos por día (para las mini-ondas), ventas de hoy y de la
  // semana: todo sale de la misma lista liviana ya traída arriba.
  const ventasPorDia = new Array(7).fill(0) as number[];
  const pedidosPorDia = new Array(7).fill(0) as number[];
  let ventasHoy = 0;
  let pedidosHoy = 0;

  for (const pedido of pedidosSemana) {
    const total = Number(pedido.total);
    ventasPorDia[pedido.creadoEn.getDay()] += total;
    pedidosPorDia[pedido.creadoEn.getDay()] += 1;

    if (pedido.creadoEn >= hoy) {
      ventasHoy += total;
      pedidosHoy += 1;
    }
  }

  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  const ventasAyer = ventasPorDia[ayer.getDay()];

  const ticketPorDia = ventasPorDia.map((monto, indice) =>
    pedidosPorDia[indice] > 0 ? monto / pedidosPorDia[indice] : 0,
  );

  const ventasSemana = pedidosSemana.reduce((suma, p) => suma + Number(p.total), 0);
  const ventasSemanaAnterior = Number(pedidosSemanaAnterior._sum.total ?? 0);
  const ticketPromedioSemana = pedidosSemana.length > 0 ? ventasSemana / pedidosSemana.length : 0;
  const ticketPromedioSemanaAnterior =
    pedidosSemanaAnterior._count > 0 ? ventasSemanaAnterior / pedidosSemanaAnterior._count : 0;

  const cambioHoyVsAyer = variacion(ventasHoy, ventasAyer);
  const cambioVsSemanaAnterior = variacion(ventasSemana, ventasSemanaAnterior);
  const cambioTicket = variacion(ticketPromedioSemana, ticketPromedioSemanaAnterior);
  const cambioPedidos = variacion(pedidosSemana.length, pedidosSemanaAnterior._count);

  const hayAlertas =
    pedidosPendientes.length > 0 || variantesBajas.length > 0 || cuponesPorVencer.length > 0;

  return (
    <>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Panel administrativo</h1>
          <p className={styles.subtitulo}>Resumen general de la tienda.</p>
        </div>
      </div>

      {/* ── Nivel 1: qué necesita atención ahora ───────────── */}
      {hayAlertas ? (
        <div className={styles.alertasGrid}>
          {pedidosPendientes.length > 0 && (
            <div className={styles.panelAlerta}>
              <div className={styles.panelAlertaTitulo}>
                <span>Pedidos por procesar</span>
                <Link href="/admin/pedidos" className={styles.badge}>
                  Ver todos
                </Link>
              </div>
              <ul className={styles.listaAlerta}>
                {pedidosPendientes.map((pedido) => (
                  <li key={pedido.id}>
                    <span>{pedido.usuario.email}</span>
                    <span>
                      {formatearPrecio(pedido.total.toString())} · {pedido.estado} ·{" "}
                      {diasDesde(pedido.creadoEn)}d
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {variantesBajas.length > 0 && (
            <div className={styles.panelAlerta}>
              <div className={styles.panelAlertaTitulo}>
                <span>Stock bajo o agotado</span>
                <Link href="/admin/stock" className={styles.badge}>
                  Ver todos
                </Link>
              </div>
              <ul className={styles.listaAlerta}>
                {variantesBajas.map((variante) => (
                  <li key={variante.id}>
                    <span>
                      {variante.producto.nombre} · {variante.talla}
                      {variante.color && ` · ${variante.color}`}
                    </span>
                    <span className={variante.cantidad === 0 ? styles.alerta : undefined}>
                      {variante.cantidad} und.
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cuponesPorVencer.length > 0 && (
            <div className={styles.panelAlerta}>
              <div className={styles.panelAlertaTitulo}>
                <span>Cupones por vencer</span>
                <Link href="/admin/cupones" className={styles.badge}>
                  Ver todos
                </Link>
              </div>
              <ul className={styles.listaAlerta}>
                {cuponesPorVencer.map((cupon) => (
                  <li key={cupon.id}>
                    <span>{cupon.codigo}</span>
                    <span>{cupon.fechaFin?.toLocaleDateString("es-PE")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className={styles.mensajeExito}>
          Todo al día: sin pedidos pendientes, stock bajo ni cupones por vencer.
        </p>
      )}

      {/* ── Nivel 2: pulso del negocio ──────────────────────── */}
      <h2 className={styles.tituloSeccionDashboard}>Ventas</h2>
      <div className={styles.tarjetas}>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{formatearPrecio(ventasHoy)}</div>
          <div className={styles.tarjetaLabel}>Ventas de hoy · {pedidosHoy} pedido(s)</div>
          <span className={cambioHoyVsAyer >= 0 ? styles.variacionPositiva : styles.variacionNegativa}>
            {cambioHoyVsAyer >= 0 ? "↑" : "↓"}
            {Math.abs(cambioHoyVsAyer)}% <span className={styles.tarjetaComparacion}>vs. ayer</span>
          </span>
          <svg className={styles.tarjetaOnda} viewBox="0 0 100 24" preserveAspectRatio="none">
            <polyline points={puntosSparkline(ventasPorDia)} />
          </svg>
        </div>

        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{formatearPrecio(ventasSemana)}</div>
          <div className={styles.tarjetaLabel}>Ventas 7 días</div>
          <span
            className={
              cambioVsSemanaAnterior >= 0 ? styles.variacionPositiva : styles.variacionNegativa
            }
          >
            {cambioVsSemanaAnterior >= 0 ? "↑" : "↓"}
            {Math.abs(cambioVsSemanaAnterior)}%{" "}
            <span className={styles.tarjetaComparacion}>vs. semana anterior</span>
          </span>
          <svg className={styles.tarjetaOnda} viewBox="0 0 100 24" preserveAspectRatio="none">
            <polyline points={puntosSparkline(ventasPorDia)} />
          </svg>
        </div>

        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{formatearPrecio(ticketPromedioSemana)}</div>
          <div className={styles.tarjetaLabel}>Ticket promedio</div>
          <span className={cambioTicket >= 0 ? styles.variacionPositiva : styles.variacionNegativa}>
            {cambioTicket >= 0 ? "↑" : "↓"}
            {Math.abs(cambioTicket)}% <span className={styles.tarjetaComparacion}>vs. semana anterior</span>
          </span>
          <svg className={styles.tarjetaOnda} viewBox="0 0 100 24" preserveAspectRatio="none">
            <polyline points={puntosSparkline(ticketPorDia)} />
          </svg>
        </div>

        <Link href="/admin/reportes" className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{pedidosSemana.length}</div>
          <div className={styles.tarjetaLabel}>Pedidos esta semana</div>
          <span className={cambioPedidos >= 0 ? styles.variacionPositiva : styles.variacionNegativa}>
            {cambioPedidos >= 0 ? "↑" : "↓"}
            {Math.abs(cambioPedidos)}% <span className={styles.tarjetaComparacion}>vs. semana anterior</span>
          </span>
          <svg className={styles.tarjetaOnda} viewBox="0 0 100 24" preserveAspectRatio="none">
            <polyline points={puntosSparkline(pedidosPorDia)} />
          </svg>
        </Link>
      </div>

      {topProductosSemana.length > 0 && (
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Más vendidos esta semana</th>
                <th>Unidades</th>
              </tr>
            </thead>
            <tbody>
              {topProductosSemana.map((producto, indice) => (
                <tr key={indice}>
                  <td>{producto.nombre}</td>
                  <td>{producto.unidades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Nivel 3: actividad reciente ─────────────────────── */}
      <h2 className={styles.tituloSeccionDashboard}>Actividad reciente</h2>
      <div className={styles.actividadGrid}>
        <div>
          <p className={styles.bloqueAyuda}>Últimos pedidos</p>
          {ultimosPedidos.length === 0 ? (
            <p className={styles.vacio}>Todavía no hay pedidos.</p>
          ) : (
            <div className={styles.tablaWrap}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosPedidos.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>{pedido.usuario.email}</td>
                      <td>{formatearPrecio(pedido.total.toString())}</td>
                      <td>
                        <span className={styles.badge}>{pedido.estado.replace("_", " ")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <p className={styles.bloqueAyuda}>Últimos usuarios registrados</p>
          {ultimosUsuarios.length === 0 ? (
            <p className={styles.vacio}>Todavía no hay usuarios.</p>
          ) : (
            <div className={styles.tablaWrap}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosUsuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Enlaces rápidos: no cambian a diario, van al pie ──── */}
      <h2 className={styles.tituloSeccionDashboard}>Catálogo</h2>
      <div className={styles.tarjetasChicas}>
        <Link href="/admin/productos" className={styles.tarjetaChica}>
          Productos
        </Link>
        <Link href="/admin/categorias" className={styles.tarjetaChica}>
          Categorías
        </Link>
        <Link href="/admin/marcas" className={styles.tarjetaChica}>
          Marcas
        </Link>
        <Link href="/admin/usuarios" className={styles.tarjetaChica}>
          Usuarios
        </Link>
      </div>
    </>
  );
}
