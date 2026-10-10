/** Precios en céntimos (enteros) para evitar errores de coma flotante. */
export type Centimos = number;

export const IGV = 0.18;

export function precioConIgv(neto: Centimos): Centimos {
  return Math.round(neto * (1 + IGV));
}

export function totalCarrito(items: { precio: Centimos; cantidad: number }[]): Centimos {
  return items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
}

/** Texto para mostrar, por ejemplo "S/ 1,299.00". Solo presentación: el cálculo sigue en céntimos. */
export function formatearPrecio(centimos: Centimos): string {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(centimos / 100);
}
