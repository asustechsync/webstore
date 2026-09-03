import type { Prisma } from "@prisma/client";

/**
 * Filtros del catálogo de la tienda.
 *
 * La URL es la única fuente de verdad: cada filtro es un parámetro de búsqueda,
 * así el resultado se puede compartir, indexar y recorrer con atrás/adelante.
 * Este archivo define los nombres de los parámetros una sola vez; la página los
 * lee con `leerFiltros` y el panel los escribe con `aParametros`.
 */

export const ORDENES = {
  nuevo: { etiqueta: "Novedades", orderBy: { creadoEn: "desc" } },
  "precio-asc": { etiqueta: "Precio: de menor a mayor", orderBy: { precio: "asc" } },
  "precio-desc": { etiqueta: "Precio: de mayor a menor", orderBy: { precio: "desc" } },
  nombre: { etiqueta: "Nombre A-Z", orderBy: { nombre: "asc" } },
} as const satisfies Record<string, { etiqueta: string; orderBy: Prisma.ProductoOrderByWithRelationInput }>;

export type ClaveOrden = keyof typeof ORDENES;

export const ORDEN_POR_DEFECTO: ClaveOrden = "nuevo";

export type FiltrosCatalogo = {
  /** Slug de categoría; en /categorias/[slug] lo fija la ruta, no la URL. */
  categoria?: string;
  /** Slug de marca; en /marcas/[slug] lo fija la ruta, no la URL. */
  marca?: string;
  tallas: string[];
  colores: string[];
  precioMin?: number;
  precioMax?: number;
  soloOfertas: boolean;
  soloDisponibles: boolean;
  orden: ClaveOrden;
  pagina: number;
};

/** Valores tal como llegan en el prop `searchParams` de una página. */
export type ParametrosBusqueda = Record<string, string | string[] | undefined>;

export const PARAMETROS = {
  categoria: "categoria",
  marca: "marca",
  talla: "talla",
  color: "color",
  precioMin: "min",
  precioMax: "max",
  ofertas: "oferta",
  disponibles: "disponible",
  orden: "orden",
  pagina: "pagina",
} as const;

/** Un mismo filtro puede repetirse en la URL (?talla=S&talla=M). */
function comoLista(valor: string | string[] | undefined): string[] {
  if (valor == null) return [];
  const valores = Array.isArray(valor) ? valor : [valor];
  return [...new Set(valores.map((v) => v.trim()).filter(Boolean))];
}

function comoTexto(valor: string | string[] | undefined): string | undefined {
  const texto = (Array.isArray(valor) ? valor[0] : valor)?.trim();
  return texto || undefined;
}

/** Number() sobre basura devuelve NaN; acá se descarta en vez de propagarse. */
function comoNumero(valor: string | string[] | undefined): number | undefined {
  const texto = comoTexto(valor);
  if (texto == null) return undefined;
  const numero = Number(texto);
  return Number.isFinite(numero) && numero >= 0 ? numero : undefined;
}

/**
 * Traduce los parámetros de la URL a filtros tipados. Todo valor inválido se
 * ignora en lugar de romper la página: la URL la escribe cualquiera.
 */
export function leerFiltros(
  parametros: ParametrosBusqueda,
  /** Filtros que impone la ruta y el usuario no puede cambiar. */
  fijos: { categoria?: string; marca?: string } = {},
): FiltrosCatalogo {
  const orden = comoTexto(parametros[PARAMETROS.orden]);
  const pagina = comoNumero(parametros[PARAMETROS.pagina]) ?? 1;
  const precioMin = comoNumero(parametros[PARAMETROS.precioMin]);
  const precioMax = comoNumero(parametros[PARAMETROS.precioMax]);

  return {
    categoria: fijos.categoria ?? comoTexto(parametros[PARAMETROS.categoria]),
    marca: fijos.marca ?? comoTexto(parametros[PARAMETROS.marca]),
    tallas: comoLista(parametros[PARAMETROS.talla]),
    colores: comoLista(parametros[PARAMETROS.color]),
    // Un rango invertido (min mayor que max) no devolvería nada; se ignora.
    ...(precioMin != null && precioMax != null && precioMin > precioMax
      ? {}
      : { precioMin, precioMax }),
    soloOfertas: comoTexto(parametros[PARAMETROS.ofertas]) === "1",
    soloDisponibles: comoTexto(parametros[PARAMETROS.disponibles]) === "1",
    orden: orden && orden in ORDENES ? (orden as ClaveOrden) : ORDEN_POR_DEFECTO,
    pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
  };
}

/** Cuántos filtros hay activos, para el contador del botón "Filtros". */
export function contarFiltrosActivos(
  filtros: FiltrosCatalogo,
  /** Los que impone la ruta no cuentan: el usuario no puede quitarlos. */
  fijos: { categoria?: boolean; marca?: boolean } = {},
): number {
  return (
    (filtros.categoria && !fijos.categoria ? 1 : 0) +
    (filtros.marca && !fijos.marca ? 1 : 0) +
    filtros.tallas.length +
    filtros.colores.length +
    (filtros.precioMin != null || filtros.precioMax != null ? 1 : 0) +
    (filtros.soloOfertas ? 1 : 0) +
    (filtros.soloDisponibles ? 1 : 0)
  );
}

// ── Orden de tallas ───────────────────────────────────────
// Alfabéticamente "XL" va antes que "S", que no es lo que espera nadie. Las
// tallas numéricas (28, 30) se ordenan como números y las de letra siguen la
// progresión de la prenda; lo desconocido va al final, alfabético.

const ESCALA_TALLAS = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function rangoTalla(talla: string): [number, number, string] {
  const normalizada = talla.trim().toUpperCase();
  const numero = Number(normalizada);
  if (Number.isFinite(numero)) return [0, numero, normalizada];

  const indice = ESCALA_TALLAS.indexOf(normalizada);
  if (indice >= 0) return [1, indice, normalizada];

  return [2, 0, normalizada];
}

export function ordenarTallas(tallas: string[]): string[] {
  return [...tallas].sort((a, b) => {
    const [grupoA, valorA, textoA] = rangoTalla(a);
    const [grupoB, valorB, textoB] = rangoTalla(b);
    if (grupoA !== grupoB) return grupoA - grupoB;
    if (valorA !== valorB) return valorA - valorB;
    return textoA.localeCompare(textoB, "es");
  });
}
