/**
 * Fórmula del descuento, compartida por el servidor y el carrito.
 *
 * El servidor decide si un cupón se puede usar (existe, está activo, vigente y
 * con usos disponibles); este módulo solo calcula cuánto descuenta. Al estar
 * en un único lugar, el importe que ve el cliente y el que confirmará el
 * checkout salen de la misma cuenta.
 */

export type TipoCupon = "PORCENTAJE" | "MONTO_FIJO";

/** Datos del cupón que el carrito necesita para recalcular sin volver al servidor. */
export type CuponAplicado = {
  codigo: string;
  tipo: TipoCupon;
  valor: number;
  montoMinimo: number | null;
};

function redondear(monto: number) {
  return Math.round(monto * 100) / 100;
}

/** Lo que falta para alcanzar el monto mínimo; 0 si ya se cumple. */
export function faltaParaMinimo(cupon: CuponAplicado, subtotal: number) {
  if (cupon.montoMinimo == null) return 0;
  return Math.max(redondear(cupon.montoMinimo - subtotal), 0);
}

/**
 * Descuento en soles. Devuelve 0 si el subtotal no llega al mínimo, y nunca
 * descuenta más que el propio subtotal.
 */
export function calcularDescuentoCupon(cupon: CuponAplicado, subtotal: number) {
  if (subtotal <= 0) return 0;
  if (faltaParaMinimo(cupon, subtotal) > 0) return 0;

  const bruto =
    cupon.tipo === "PORCENTAJE" ? (subtotal * cupon.valor) / 100 : cupon.valor;

  return redondear(Math.min(bruto, subtotal));
}
