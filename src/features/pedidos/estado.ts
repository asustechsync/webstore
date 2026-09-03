import { EstadoPedido } from "@prisma/client";

export const NOMBRES_ESTADO_PEDIDO: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADO: "Pagado",
  EN_PREPARACION: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/**
 * Estados en los que el pedido todavía no representa una venta cerrada.
 *
 * Fuera de estos dos el pedido ya movió mercadería o dinero, y borrarlo
 * descuadraría los reportes sin forma de recuperarlo: primero hay que
 * cancelarlo, que deja rastro, y recién entonces se puede eliminar.
 *
 * Vive acá y no en `actions.ts` porque un archivo "use server" solo puede
 * exportar funciones async, y la tabla del panel necesita esta regla para
 * decidir si el botón de eliminar va habilitado.
 */
export const ESTADOS_ELIMINABLES: EstadoPedido[] = [
  EstadoPedido.PENDIENTE,
  EstadoPedido.CANCELADO,
];

export function sePuedeEliminar(estado: EstadoPedido) {
  return ESTADOS_ELIMINABLES.includes(estado);
}
