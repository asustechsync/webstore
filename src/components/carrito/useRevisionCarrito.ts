"use client";

import { useEffect, useState } from "react";
import { revisarVariantes } from "@/features/carrito/actions";
import {
  revisarLineas,
  type InfoVariante,
  type LineaRevisada,
} from "@/features/carrito/revision";
import type { ItemCarrito } from "@/store/cartStore";

/** Respuesta del servidor junto al carrito al que corresponde. */
type Respuesta = { claves: string; infos: InfoVariante[] };

/**
 * Contrasta el carrito guardado con el catálogo.
 *
 * Consulta solo cuando cambia *qué* variantes hay, no cuántas unidades: subir
 * o bajar una cantidad se revisa en el navegador contra el stock que ya se
 * conoce. Cada respuesta viaja con la lista de variantes que consultó, así
 * una que llega tarde no se aplica a un carrito que ya cambió, y mientras
 * tanto las líneas se devuelven sin avisos para no acusar de "no disponible"
 * a un producto que todavía no se revisó.
 */
export function useRevisionCarrito(items: ItemCarrito[], hidratado: boolean) {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [fallo, setFallo] = useState<{ claves: string } | null>(null);
  const [intento, setIntento] = useState(0);

  const claves = items
    .map((item) => item.varianteId)
    .sort()
    .join(",");

  useEffect(() => {
    if (!hidratado || claves === "") return;

    let vigente = true;

    revisarVariantes(claves.split(","))
      .then((resultado) => {
        if (!vigente) return;
        if (!resultado.ok) {
          setFallo({ claves });
          return;
        }
        setFallo(null);
        setRespuesta({ claves, infos: resultado.datos });
      })
      .catch(() => {
        if (vigente) setFallo({ claves });
      });

    return () => {
      vigente = false;
    };
  }, [claves, hidratado, intento]);

  const alDia = respuesta?.claves === claves;
  const error = fallo?.claves === claves;
  // Un carrito vacío no necesita consulta: ya está revisado.
  const revisado = claves === "" || alDia;

  const lineas: LineaRevisada<ItemCarrito>[] =
    alDia && respuesta
      ? revisarLineas(items, respuesta.infos)
      : items.map((item) => ({ item, info: null, avisos: [] }));

  return {
    lineas,
    revisado,
    cargando: !revisado && !error,
    error,
    /** Vuelve a preguntar al servidor; lo usa el botón de reintentar. */
    verificar: () => setIntento((numero) => numero + 1),
  };
}
