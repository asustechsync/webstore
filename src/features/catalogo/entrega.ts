/**
 * Reglas de entrega y pago que muestra la ficha de producto.
 *
 * Son valores de tienda, no de catálogo: viven acá para poder ajustarlos en un
 * solo sitio sin tocar los componentes. Revísalos antes de salir a producción.
 */
export const ENTREGA = {
  /** Rango de días hábiles que tarda un envío a provincia. */
  diasHabilesMinimo: 2,
  diasHabilesMaximo: 5,
  /** Desde este monto el envío no se cobra. */
  envioGratisDesde: 99,
  /** Mientras no haya tienda física, la tarjeta de recojo se muestra apagada. */
  recojoEnTienda: false,
  /** Cuotas que ofrece la pasarela; el desglose solo aparece desde `cuotasDesde`. */
  cuotasMaximas: 12,
  cuotasDesde: 200,
} as const;

const FORMATO_FECHA = new Intl.DateTimeFormat("es-PE", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** Avanza saltando sábados y domingos: Shalom no despacha fin de semana. */
function sumarDiasHabiles(desde: Date, dias: number) {
  const fecha = new Date(desde);
  let restantes = dias;
  while (restantes > 0) {
    fecha.setDate(fecha.getDate() + 1);
    const dia = fecha.getDay();
    if (dia !== 0 && dia !== 6) restantes -= 1;
  }
  return fecha;
}

export type RangoEntrega = { desde: string; hasta: string };

/**
 * Se calcula en el servidor y viaja ya formateado: si el componente cliente
 * llamara a `new Date()` por su cuenta, el HTML del servidor y el del navegador
 * podrían diferir y React marcaría un error de hidratación.
 */
export function estimarEntrega(hoy = new Date()): RangoEntrega {
  return {
    desde: FORMATO_FECHA.format(sumarDiasHabiles(hoy, ENTREGA.diasHabilesMinimo)),
    hasta: FORMATO_FECHA.format(sumarDiasHabiles(hoy, ENTREGA.diasHabilesMaximo)),
  };
}
