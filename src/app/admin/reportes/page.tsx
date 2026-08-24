import { db } from "@/lib/db";
import { requirePermiso } from "@/lib/auth";
import { formatearPrecio } from "@/lib/utils";
import { PageHeader } from "@/components/ui";
import { FiltroFechas } from "./FiltroFechas";
import styles from "../admin.module.css";

// Estados que cuentan como venta real; un pedido PENDIENTE (no pagado aún) o
// CANCELADO no debería sumar a los reportes de ingresos.
const ESTADOS_VENTA = ["PAGADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO"] as const;

function haceDias(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
}

export default async function AdminReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  await requirePermiso("pedidos.ver");

  const { desde, hasta } = await searchParams;

  const fechaDesde = desde ? new Date(`${desde}T00:00:00`) : haceDias(30);
  const fechaHasta = hasta ? new Date(`${hasta}T23:59:59`) : new Date();

  const pedidos = await db.pedido.findMany({
    where: {
      estado: { in: [...ESTADOS_VENTA] },
      creadoEn: { gte: fechaDesde, lte: fechaHasta },
    },
    include: {
      items: { include: { variante: { include: { producto: true } } } },
    },
  });

  const totalVentas = pedidos.reduce((suma, pedido) => suma + Number(pedido.total), 0);
  const cantidadPedidos = pedidos.length;
  const ticketPromedio = cantidadPedidos > 0 ? totalVentas / cantidadPedidos : 0;
  const costoTotal = pedidos.reduce(
    (suma, pedido) =>
      suma +
      pedido.items.reduce((subtotal, item) => {
        const costo = item.costoUnit ?? item.variante.costo ?? item.variante.producto.costo ?? 0;
        return subtotal + item.cantidad * Number(costo);
      }, 0),
    0,
  );
  const gananciaBruta = totalVentas - costoTotal;
  const margenBruto = totalVentas > 0 ? (gananciaBruta / totalVentas) * 100 : 0;

  // Se agrega en memoria (no en la base) porque el ingreso por producto es
  // cantidad × precioUnit, una expresión que Prisma no puede sumar directo.
  const porProducto = new Map<
    string,
    { nombre: string; unidades: number; ingreso: number; costo: number }
  >();

  for (const pedido of pedidos) {
    for (const item of pedido.items) {
      const producto = item.variante.producto;
      const actual = porProducto.get(producto.id) ?? {
        nombre: producto.nombre,
        unidades: 0,
        ingreso: 0,
        costo: 0,
      };
      actual.unidades += item.cantidad;
      actual.ingreso += item.cantidad * Number(item.precioUnit);
      actual.costo +=
        item.cantidad *
        Number(item.costoUnit ?? item.variante.costo ?? item.variante.producto.costo ?? 0);
      porProducto.set(producto.id, actual);
    }
  }

  const masVendidos = [...porProducto.values()]
    .sort((a, b) => b.ingreso - a.ingreso)
    .slice(0, 10);

  return (
    <>
      <PageHeader
        titulo="Reportes de ventas"
        descripcion="Solo se cuentan pedidos pagados o en curso; excluye pendientes y cancelados."
      />

      <FiltroFechas />

      <div className={styles.tarjetas}>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{formatearPrecio(totalVentas)}</div>
          <div className={styles.tarjetaLabel}>Ventas totales</div>
        </div>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{cantidadPedidos}</div>
          <div className={styles.tarjetaLabel}>Pedidos</div>
        </div>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{formatearPrecio(ticketPromedio)}</div>
          <div className={styles.tarjetaLabel}>Ticket promedio</div>
        </div>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{formatearPrecio(costoTotal)}</div>
          <div className={styles.tarjetaLabel}>Costo de productos</div>
        </div>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{formatearPrecio(gananciaBruta)}</div>
          <div className={styles.tarjetaLabel}>Ganancia bruta</div>
        </div>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{margenBruto.toFixed(1)}%</div>
          <div className={styles.tarjetaLabel}>Margen bruto</div>
        </div>
      </div>

      <section className={`${styles.seccion} ${styles.seccionEspaciada}`}>
        <h2 className={styles.titulo}>Productos más vendidos</h2>

        {masVendidos.length === 0 ? (
          <p className={styles.vacio}>No hay ventas en el período seleccionado.</p>
        ) : (
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Unidades vendidas</th>
                  <th>Ingreso generado</th>
                  <th>Costo</th>
                  <th>Ganancia</th>
                  <th>Margen</th>
                </tr>
              </thead>
              <tbody>
                {masVendidos.map((producto, indice) => (
                  <tr key={indice}>
                    <td>{producto.nombre}</td>
                    <td>{producto.unidades}</td>
                    <td>{formatearPrecio(producto.ingreso)}</td>
                    <td>{formatearPrecio(producto.costo)}</td>
                    <td>{formatearPrecio(producto.ingreso - producto.costo)}</td>
                    <td>
                      {producto.ingreso > 0
                        ? `${(((producto.ingreso - producto.costo) / producto.ingreso) * 100).toFixed(1)}%`
                        : "0.0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
