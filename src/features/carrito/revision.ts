/**
 * Revisión del carrito contra el catálogo.
 *
 * El carrito vive en el navegador y puede quedar guardado días; mientras
 * tanto el catálogo cambia de precio, se queda sin stock o retira una
 * variante. Este módulo compara lo guardado con lo que el servidor dice hoy
 * y describe las diferencias. No toca la base ni el estado: es solo cálculo,
 * así el mismo resultado alimenta la lista, el resumen y el aviso, y se puede
 * probar sin navegador.
 */
import { formatearPrecio } from "@/lib/utils";

/** Lo mínimo que necesita una línea del carrito para revisarse. */
export type ItemRevisable = { varianteId: string; cantidad: number; precio: number };

/** Estado actual de una variante, tal como lo devuelve el servidor. */
export type InfoVariante = {
  varianteId: string;
  nombre: string;
  /** La variante y su producto siguen publicados. */
  activa: boolean;
  stock: number;
  /** Precio que se cobraría hoy, con la oferta ya aplicada. */
  precio: number;
  /** Precio sin oferta; sirve para mostrar cuánto se ahorra. */
  precioLista: number;
};

export type Aviso =
  | { tipo: "retirado" }
  | { tipo: "agotado" }
  | { tipo: "stock"; disponible: number }
  | { tipo: "precio"; anterior: number; actual: number };

export type LineaRevisada<T extends ItemRevisable = ItemRevisable> = {
  item: T;
  info: InfoVariante | null;
  avisos: Aviso[];
};

/** Los precios son decimales de dos cifras: se comparan en céntimos enteros. */
function enCentimos(monto: number) {
  return Math.round(monto * 100);
}

/**
 * Precio que realmente se cobra por una variante: el suyo si lo tiene, si no
 * el del producto, y siempre la oferta cuando es menor. Es la misma regla que
 * aplica el checkout al crear el pedido.
 */
export function precioEfectivo(
  precioVariante: number | null,
  precioProducto: number,
  precioOferta: number | null,
) {
  const base = precioVariante ?? precioProducto;
  if (precioOferta == null) return base;
  return precioOferta < base ? precioOferta : base;
}

/** Diferencias entre lo que guarda una línea y lo que hay en el catálogo. */
export function avisosDeLinea(item: ItemRevisable, info: InfoVariante | null): Aviso[] {
  // Una variante que ya no vuelve de la consulta, o que quedó despublicada,
  // no se puede comprar: no tiene sentido revisar su precio ni su stock.
  if (info == null || !info.activa) return [{ tipo: "retirado" }];

  const avisos: Aviso[] = [];

  if (info.stock <= 0) {
    avisos.push({ tipo: "agotado" });
  } else if (item.cantidad > info.stock) {
    avisos.push({ tipo: "stock", disponible: info.stock });
  }

  if (enCentimos(item.precio) !== enCentimos(info.precio)) {
    avisos.push({ tipo: "precio", anterior: item.precio, actual: info.precio });
  }

  return avisos;
}

export function revisarLineas<T extends ItemRevisable>(
  items: T[],
  infos: InfoVariante[],
): LineaRevisada<T>[] {
  const porId = new Map(infos.map((info) => [info.varianteId, info]));
  return items.map((item) => {
    const info = porId.get(item.varianteId) ?? null;
    return { item, info, avisos: avisosDeLinea(item, info) };
  });
}

export function contarAvisos(lineas: LineaRevisada[]) {
  return lineas.reduce((total, linea) => total + linea.avisos.length, 0);
}

/**
 * Deja el carrito como el catálogo lo permite: sin lo que ya no se vende,
 * con las cantidades recortadas al stock y con los precios de hoy. Es lo que
 * ejecuta el botón "Actualizar carrito" de un solo toque.
 */
export function ajustarLineas<T extends ItemRevisable>(lineas: LineaRevisada<T>[]): T[] {
  const ajustados: T[] = [];

  for (const { item, info } of lineas) {
    if (info == null || !info.activa || info.stock <= 0) continue;
    ajustados.push({
      ...item,
      cantidad: Math.min(item.cantidad, info.stock),
      precio: info.precio,
    });
  }

  return ajustados;
}

/**
 * Cuánto ahorra el carrito por precios de oferta, sin contar el cupón. Las
 * líneas con el precio desactualizado quedan fuera: mientras no se actualicen
 * no se sabe qué se va a cobrar, y anunciar un ahorro que no cuadra con el
 * subtotal confunde más de lo que ayuda.
 */
export function calcularAhorroOfertas(lineas: LineaRevisada[]) {
  const total = lineas.reduce((suma, { item, info }) => {
    if (info == null || enCentimos(item.precio) !== enCentimos(info.precio)) return suma;
    const ahorro = info.precioLista - info.precio;
    return ahorro > 0 ? suma + ahorro * item.cantidad : suma;
  }, 0);

  return Math.round(total * 100) / 100;
}

/** Texto que ve quien compra. Vive acá para decir lo mismo en toda la página. */
export function describirAviso(aviso: Aviso) {
  switch (aviso.tipo) {
    case "retirado":
      return "Ya no está disponible en la tienda";
    case "agotado":
      return "Se quedó sin stock";
    case "stock":
      return `Solo quedan ${aviso.disponible} ${aviso.disponible === 1 ? "unidad" : "unidades"}`;
    case "precio":
      return aviso.actual > aviso.anterior
        ? `Subió de ${formatearPrecio(aviso.anterior)} a ${formatearPrecio(aviso.actual)}`
        : `Bajó de ${formatearPrecio(aviso.anterior)} a ${formatearPrecio(aviso.actual)}`;
  }
}
