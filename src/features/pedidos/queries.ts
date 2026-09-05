import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { ETIQUETAS_ADMIN, VIDA_DASHBOARD } from "@/features/admin/cache";
import { obtenerMetodoPago } from "./metodos-pago";

/**
 * Todos los pedidos con su resumen, para /admin/pedidos.
 *
 * Antes esta consulta (con 3 niveles de `include`) corría en cada carga de la
 * página. Cachearla la sirve de memoria; `cambiarEstadoPedido`, `eliminarPedido`
 * y `crearPedido` invalidan `ETIQUETAS_ADMIN.pedidos` al guardar, así la lista
 * refleja el cambio de inmediato en vez de esperar a que la caché expire.
 */
export async function listarPedidosAdmin() {
  "use cache";
  cacheTag(ETIQUETAS_ADMIN.pedidos);
  cacheLife(VIDA_DASHBOARD);

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

  return pedidos.map((pedido) => {
    const metodo = obtenerMetodoPago(pedido.metodoPago);
    const subtotal = Number(pedido.subtotal);
    const descuento = Number(pedido.descuento);
    const costoEnvio = Number(pedido.costoEnvio);
    const total = Number(pedido.total);
    const tieneEnvio = Boolean(pedido.envioDireccion);

    return {
      id: pedido.id,
      cliente: [pedido.usuario.nombre, pedido.usuario.apellidoPaterno].filter(Boolean).join(" "),
      correo: pedido.usuario.email,
      telefono: pedido.usuario.telefono,
      total,
      estado: pedido.estado,
      items: pedido.items.length,
      creadoEn: pedido.creadoEn.toISOString(),
      resumen: {
        subtotal,
        descuento: descuento > 0 ? descuento : null,
        costoEnvio: costoEnvio > 0 ? costoEnvio : null,
        total,
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
            precioUnit,
            subtotal: precioUnit * item.cantidad,
          };
        }),
      },
    };
  });
}

export type PedidoAdmin = Awaited<ReturnType<typeof listarPedidosAdmin>>[number];
