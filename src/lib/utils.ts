export function formatearPrecio(valor: number | string) {
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(numero);
}

export function slugificar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Porcentaje de descuento redondeado, o null si el producto no está rebajado. */
export function calcularDescuento(precio: number | string, precioOferta: number | string | null) {
  if (precioOferta == null) return null;
  const base = Number(precio);
  const rebajado = Number(precioOferta);
  if (!(base > 0) || !(rebajado < base)) return null;
  return Math.round(((base - rebajado) / base) * 100);
}

/**
 * Resumen de un listado del catálogo. La tienda pinta una tarjeta por
 * variante, así que cuando hay más tarjetas que productos lo dice en vez de
 * contradecir lo que se ve en pantalla.
 */
export function describirCatalogo(productos: number, tarjetas: number) {
  const base = `${productos} producto${productos === 1 ? "" : "s"}`;
  if (tarjetas <= productos) return base;
  return `${base} · ${tarjetas} variante${tarjetas === 1 ? "" : "s"}`;
}
