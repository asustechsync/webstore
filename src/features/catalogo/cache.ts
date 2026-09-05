/**
 * Etiquetas del caché del catálogo.
 *
 * Las consultas públicas (portada, ficha de producto, categorías) devuelven lo
 * mismo para todos los visitantes, así que no tiene sentido pegarle a Supabase
 * una vez por persona: se guardan con `unstable_cache` y se sirven de memoria.
 *
 * La frescura no se deja solo al tiempo. Cuando el administrador guarda algo,
 * la propia acción invalida la etiqueta que corresponde y el cambio se ve en
 * la tienda de inmediato; el `revalidate` es solo la red de seguridad por si
 * algo se modificara fuera del panel.
 */
export const ETIQUETAS = {
  /** Productos: precios, stock, publicación, destacados y ofertas. */
  productos: "catalogo:productos",
  /** Categorías y su conteo de productos. */
  categorias: "catalogo:categorias",
  /** Marcas visibles en la tienda. */
  marcas: "catalogo:marcas",
} as const;

/**
 * Vida del caché antes de recalcularse solo. Una hora es holgado porque el
 * panel invalida por etiqueta en cuanto guarda: esto solo cubre el caso raro
 * de un cambio hecho directamente en la base.
 */
export const VIDA_CATALOGO = { revalidate: 3600, expire: 86_400 } as const;
