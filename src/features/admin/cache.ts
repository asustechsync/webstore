/**
 * Etiqueta del caché del dashboard de administración.
 *
 * El panel de inicio arma su tablero con 11 consultas (pedidos pendientes,
 * stock bajo, cupones por vencer, ventas de la semana, actividad reciente...).
 * Repetirlas en cada carga de /admin es el motivo de que tardara cientos de
 * milisegundos: se guardan con `use cache` y se sirven de memoria.
 *
 * Igual que el catálogo, la frescura no se deja solo al tiempo: cada acción
 * que toca pedidos, stock, cupones o usuarios invalida esta etiqueta al
 * guardar, así el tablero refleja el cambio de inmediato.
 */
export const ETIQUETAS_ADMIN = {
  dashboard: "admin:dashboard",
  /** Listado completo de /admin/pedidos. */
  pedidos: "admin:pedidos",
} as const;

/**
 * Vida corta a propósito: el tablero se arma alrededor de "hoy" (ventanas de
 * 7/14 días), así que aunque nada lo invalide, se recalcula solo antes de que
 * ese corte de fecha se note.
 */
export const VIDA_DASHBOARD = { revalidate: 120, expire: 3600 } as const;
