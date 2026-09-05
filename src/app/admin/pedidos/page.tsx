import { formatearPrecio } from "@/lib/utils";
import { PageHeader } from "@/components/ui";
import { listarPedidosAdmin } from "@/features/pedidos/queries";
import { PedidosTabla } from "./PedidosTabla";

export default async function AdminPedidosPage() {
  // Antes: `db.pedido.findMany` con 3 niveles de `include` en cada carga.
  // Ahora la consulta vive cacheada en `listarPedidosAdmin`; las acciones que
  // crean, cambian o borran un pedido invalidan esa caché al guardar.
  const pedidos = await listarPedidosAdmin();

  return (
    <>
      <PageHeader
        titulo="Pedidos"
        descripcion="Cambia el estado de un pedido y expande la fila para ver su contenido."
      />

      <PedidosTabla
        pedidos={pedidos.map((pedido) => ({
          id: pedido.id,
          cliente: pedido.cliente,
          correo: pedido.correo,
          telefono: pedido.telefono,
          total: formatearPrecio(pedido.total),
          estado: pedido.estado,
          items: pedido.items,
          creadoEn: new Date(pedido.creadoEn).toLocaleDateString("es-PE"),
          resumen: {
            subtotal: formatearPrecio(pedido.resumen.subtotal),
            descuento: pedido.resumen.descuento != null ? formatearPrecio(pedido.resumen.descuento) : null,
            costoEnvio: pedido.resumen.costoEnvio != null ? formatearPrecio(pedido.resumen.costoEnvio) : null,
            total: formatearPrecio(pedido.resumen.total),
            cupon: pedido.resumen.cupon,
            metodoPago: pedido.resumen.metodoPago,
            envio: pedido.resumen.envio,
            productos: pedido.resumen.productos.map((producto) => ({
              id: producto.id,
              nombre: producto.nombre,
              opciones: producto.opciones,
              cantidad: producto.cantidad,
              precioUnit: formatearPrecio(producto.precioUnit),
              subtotal: formatearPrecio(producto.subtotal),
            })),
          },
        }))}
      />
    </>
  );
}
