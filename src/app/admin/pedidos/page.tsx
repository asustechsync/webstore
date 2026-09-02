import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import { PageHeader } from "@/components/ui";
import { obtenerMetodoPago } from "@/features/pedidos/metodos-pago";
import { PedidosTabla } from "./PedidosTabla";

export default async function AdminPedidosPage() {
  const pedidos = await db.pedido.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      usuario: { select: { nombre: true, apellidoPaterno: true, email: true, telefono: true } },
      cupon: { select: { codigo: true } },
      // Mismo shape que la ficha de pedido del cliente: la variante trae sus
      // valores de opción para armar "Talla: M · Color: Negro" en el resumen.
      items: {
        include: {
          variante: {
            include: {
              producto: { select: { nombre: true } },
              valores: { include: { valor: { include: { opcion: true } } } },
            },
          },
        },
      },
    },
  });

  return (
    <>
      <PageHeader
        titulo="Pedidos"
        descripcion="Cambia el estado de un pedido y expande la fila para ver su contenido."
      />

      <PedidosTabla
        pedidos={pedidos.map((pedido) => {
          const metodo = obtenerMetodoPago(pedido.metodoPago);
          const subtotal = Number(pedido.subtotal);
          const descuento = Number(pedido.descuento);
          const costoEnvio = Number(pedido.costoEnvio);
          const tieneEnvio = Boolean(pedido.envioDireccion);

          return {
            id: pedido.id,
            cliente: [pedido.usuario.nombre, pedido.usuario.apellidoPaterno].filter(Boolean).join(" "),
            correo: pedido.usuario.email,
            telefono: pedido.usuario.telefono,
            // Decimal no es serializable hacia un componente cliente.
            total: formatearPrecio(pedido.total.toString()),
            estado: pedido.estado,
            items: pedido.items.length,
            creadoEn: pedido.creadoEn.toLocaleDateString("es-PE"),
            resumen: {
              subtotal: formatearPrecio(subtotal),
              descuento: descuento > 0 ? formatearPrecio(descuento) : null,
              costoEnvio: costoEnvio > 0 ? formatearPrecio(costoEnvio) : null,
              total: formatearPrecio(pedido.total.toString()),
              cupon: pedido.cupon?.codigo ?? null,
              metodoPago: metodo?.nombre ?? "Por definir",
              envio: tieneEnvio
                ? {
                    destinatario: pedido.envioDestinatario ?? "",
                    telefono: pedido.envioTelefono ?? "",
                    direccion: pedido.envioDireccion ?? "",
                    referencia: pedido.envioReferencia ?? "",
                    distrito: pedido.envioDistrito ?? "",
                    provincia: pedido.envioProvincia ?? "",
                    departamento: pedido.envioDepartamento ?? "",
                  }
                : null,
              productos: pedido.items.map((item) => {
                const atributos = item.variante.valores
                  .map(({ valor }) => `${valor.opcion.nombre}: ${valor.valor}`)
                  .join(" · ");
                const precioUnit = Number(item.precioUnit);

                return {
                  id: item.id,
                  nombre: item.variante.producto.nombre,
                  opciones: atributos || item.variante.sku,
                  cantidad: item.cantidad,
                  precioUnit: formatearPrecio(precioUnit),
                  subtotal: formatearPrecio(precioUnit * item.cantidad),
                };
              }),
            },
          };
        })}
      />
    </>
  );
}
