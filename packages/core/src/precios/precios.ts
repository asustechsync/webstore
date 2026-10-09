/** Precios en céntimos (enteros) para evitar errores de coma flotante. */
export type Centimos = number;

export const IGV = 0.18;

export function precioConIgv(neto: Centimos): Centimos {
  return Math.round(neto * (1 + IGV));
}

export function totalCarrito(items: { precio: Centimos; cantidad: number }[]): Centimos {
  return items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
}
