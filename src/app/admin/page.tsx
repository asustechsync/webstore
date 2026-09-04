import Link from "next/link";
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import styles from "./admin.module.css";
import { DashboardControles } from "./DashboardControles";

// Mismo criterio que en Reportes: solo estos estados cuentan como venta real.
const ESTADOS_VENTA = ["PAGADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO"] as const;
// Un pedido en estos estados todavía necesita que alguien lo mueva.
const ESTADOS_PENDIENTES = ["PENDIENTE", "PAGADO"] as const;

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

export default async function AdminDashboardPage() {
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
    clientesNuevosSemana,
    clientesNuevosSemanaAnterior,
    clientesRecurrentes,
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
    db.usuario.count({ where: { creadoEn: { gte: hace7Dias } } }),
    db.usuario.count({ where: { creadoEn: { gte: hace14Dias, lt: hace7Dias } } }),
    db.usuario.count({
      where: {
        AND: [
          { pedidos: { some: { estado: { in: [...ESTADOS_VENTA] }, creadoEn: { gte: hace7Dias } } } },
          { pedidos: { some: { estado: { in: [...ESTADOS_VENTA] }, creadoEn: { lt: hace7Dias } } } },
        ],
      },
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

  const ventasSemana = pedidosSemana.reduce((suma, p) => suma + Number(p.total), 0);
  const ventasSemanaAnterior = Number(pedidosSemanaAnterior._sum.total ?? 0);
  const ticketPromedioSemana = pedidosSemana.length > 0 ? ventasSemana / pedidosSemana.length : 0;
  const ticketPromedioSemanaAnterior =
    pedidosSemanaAnterior._count > 0 ? ventasSemanaAnterior / pedidosSemanaAnterior._count : 0;

  const cambioVsSemanaAnterior = variacion(ventasSemana, ventasSemanaAnterior);
  const cambioTicket = variacion(ticketPromedioSemana, ticketPromedioSemanaAnterior);
  const cambioPedidos = variacion(pedidosSemana.length, pedidosSemanaAnterior._count);
  const cambioClientesNuevos = variacion(clientesNuevosSemana, clientesNuevosSemanaAnterior);

  const hayAlertas =
    pedidosPendientes.length > 0 || variantesBajas.length > 0 || cuponesPorVencer.length > 0;

  return (
    <>
      {/* Sin encabezado de página: el menú lateral ya marca "Inicio" como
          sección activa, y este panel arranca directo con lo que importa. */}
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
                      {variante.producto.nombre}
                      {variante.talla && ` · ${variante.talla}`}
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
      ) : null}

      {/* ── Nivel 2: pulso del negocio ──────────────────────── */}
      <div className={styles.dashboardCabecera}>
        <h2 className={styles.tituloSeccionDashboard}>Ventas</h2>
        <DashboardControles />
      </div>
      <div className={`${styles.tarjetas} ${styles.tarjetasDashboard}`}>
        <div className={`${styles.tarjeta} ${styles.tarjetaDashboard}`}>
          <div className={styles.tarjetaDashboardEncabezado}>
            <div className={styles.tarjetaLabel}>Clientes nuevos</div>
            <span className={`${styles.tarjetaVariacion} ${cambioClientesNuevos >= 0 ? styles.tarjetaVariacionPositiva : styles.tarjetaVariacionNegativa}`}>
              {cambioClientesNuevos >= 0 ? "+" : "−"}{Math.abs(cambioClientesNuevos)}%
            </span>
          </div>
          <div className={styles.tarjetaDashboardValor}>
            {clientesNuevosSemana}
            <span className={`${styles.tarjetaDireccion} ${cambioClientesNuevos >= 0 ? styles.tarjetaDireccionPositiva : styles.tarjetaDireccionNegativa}`} aria-hidden="true">{cambioClientesNuevos >= 0 ? "↑" : "↓"}</span>
          </div>
          <div className={styles.tarjetaDashboardContexto}>{cambioClientesNuevos >= 0 ? "Subió" : "Bajó"} {Math.abs(cambioClientesNuevos)}% vs. semana anterior</div>
        </div>

        <div className={`${styles.tarjeta} ${styles.tarjetaDashboard}`}>
          <div className={styles.tarjetaDashboardEncabezado}>
            <div className={styles.tarjetaLabel}>Ventas 7 días</div>
            <span className={`${styles.tarjetaVariacion} ${cambioVsSemanaAnterior >= 0 ? styles.tarjetaVariacionPositiva : styles.tarjetaVariacionNegativa}`}>
              {cambioVsSemanaAnterior >= 0 ? "+" : "−"}{Math.abs(cambioVsSemanaAnterior)}%
            </span>
          </div>
          <div className={styles.tarjetaDashboardValor}>
            {formatearPrecio(ventasSemana)}
            <span className={`${styles.tarjetaDireccion} ${cambioVsSemanaAnterior >= 0 ? styles.tarjetaDireccionPositiva : styles.tarjetaDireccionNegativa}`} aria-hidden="true">{cambioVsSemanaAnterior >= 0 ? "↑" : "↓"}</span>
          </div>
          <div className={styles.tarjetaDashboardContexto}>{cambioVsSemanaAnterior >= 0 ? "Subió" : "Bajó"} {Math.abs(cambioVsSemanaAnterior)}% vs. semana anterior</div>
        </div>

        <div className={`${styles.tarjeta} ${styles.tarjetaDashboard}`}>
          <div className={styles.tarjetaDashboardEncabezado}>
            <div className={styles.tarjetaLabel}>Ticket promedio</div>
            <span className={`${styles.tarjetaVariacion} ${cambioTicket >= 0 ? styles.tarjetaVariacionPositiva : styles.tarjetaVariacionNegativa}`}>
              {cambioTicket >= 0 ? "+" : "−"}{Math.abs(cambioTicket)}%
            </span>
          </div>
          <div className={styles.tarjetaDashboardValor}>
            {formatearPrecio(ticketPromedioSemana)}
            <span className={`${styles.tarjetaDireccion} ${cambioTicket >= 0 ? styles.tarjetaDireccionPositiva : styles.tarjetaDireccionNegativa}`} aria-hidden="true">{cambioTicket >= 0 ? "↑" : "↓"}</span>
          </div>
          <div className={styles.tarjetaDashboardContexto}>{cambioTicket >= 0 ? "Subió" : "Bajó"} {Math.abs(cambioTicket)}% vs. semana anterior</div>
        </div>

        <Link href="/admin/reportes" className={`${styles.tarjeta} ${styles.tarjetaDashboard}`}>
          <div className={styles.tarjetaDashboardEncabezado}>
            <div className={styles.tarjetaLabel}>Pedidos semanales</div>
            <span className={`${styles.tarjetaVariacion} ${cambioPedidos >= 0 ? styles.tarjetaVariacionPositiva : styles.tarjetaVariacionNegativa}`}>
              {cambioPedidos >= 0 ? "+" : "−"}{Math.abs(cambioPedidos)}%
            </span>
          </div>
          <div className={styles.tarjetaDashboardValor}>
            {pedidosSemana.length}
            <span className={`${styles.tarjetaDireccion} ${cambioPedidos >= 0 ? styles.tarjetaDireccionPositiva : styles.tarjetaDireccionNegativa}`} aria-hidden="true">{cambioPedidos >= 0 ? "↑" : "↓"}</span>
          </div>
          <div className={styles.tarjetaDashboardContexto}>{cambioPedidos >= 0 ? "Subió" : "Bajó"} {Math.abs(cambioPedidos)}% vs. semana anterior</div>
        </Link>

        <Link href="/admin/clientes" className={`${styles.tarjeta} ${styles.tarjetaDashboard}`}>
          <div className={styles.tarjetaDashboardEncabezado}>
            <div className={styles.tarjetaLabel}>Clientes recurrentes</div>
            <span className={`${styles.tarjetaVariacion} ${styles.tarjetaVariacionPositiva}`}>Activo</span>
          </div>
          <div className={styles.tarjetaDashboardValor}>
            {clientesRecurrentes}
            <span className={`${styles.tarjetaDireccion} ${styles.tarjetaDireccionPositiva}`} aria-hidden="true">↗</span>
          </div>
          <div className={styles.tarjetaDashboardContexto}>Compraron esta semana y ya habían comprado antes</div>
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
