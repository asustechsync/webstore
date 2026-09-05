"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { DetalleVista, VarianteVista } from "@/features/catalogo/detalle";

/**
 * Variante elegida en la ficha de producto.
 *
 * La galería y la caja de compra están en columnas distintas de la grilla, así
 * que no pueden compartir un `useState`: la selección vive acá para que elegir
 * un color en el configurador cambie a la vez el precio, el stock y la foto.
 */

type Seleccion = Record<string, string>;

type ValorContexto = {
  seleccion: Seleccion;
  elegir: (clave: string, valorId: string) => void;
  /** Salta a una variante concreta; lo usa la galería al tocar una foto. */
  seleccionarVariante: (varianteId: string) => void;
  /** Variante exacta que corresponde a la selección, o null si no existe. */
  variante: VarianteVista | null;
  /** La galería necesita las fotos de todas las variantes, no solo la activa. */
  detalle: DetalleVista;
};

const Contexto = createContext<ValorContexto | null>(null);

/** Variante que corresponde exactamente a los valores elegidos. */
function buscarVariante(detalle: DetalleVista, seleccion: Seleccion) {
  const elegidos = detalle.opciones.map((opcion) => seleccion[opcion.clave]);
  if (elegidos.some((valor) => !valor)) return null;
  return (
    detalle.variantes.find((variante) =>
      elegidos.every((valorId) => variante.valores.includes(valorId)),
    ) ?? null
  );
}

function seleccionDeVariante(detalle: DetalleVista, variante: VarianteVista): Seleccion {
  const seleccion: Seleccion = {};
  for (const opcion of detalle.opciones) {
    const valor = opcion.valores.find((v) => variante.valores.includes(v.id));
    if (valor) seleccion[opcion.clave] = valor.id;
  }
  return seleccion;
}

/** La pedida por la URL; si no, la primera con stock; si no, la primera. */
function varianteInicial(detalle: DetalleVista, varianteId: string | null) {
  const pedida = varianteId
    ? detalle.variantes.find((variante) => variante.id === varianteId)
    : undefined;
  return (
    pedida ??
    detalle.variantes.find((variante) => variante.cantidad > 0) ??
    detalle.variantes[0] ??
    null
  );
}

/*
 * `?variante=` leído de forma segura para la hidratación.
 *
 * El servidor devuelve null porque la ficha se pre-construye y ahí no existe
 * la URL del visitante; el navegador devuelve el valor real. Así el HTML sale
 * igual para todos —que es lo que permite cachearlo— y la variante pedida se
 * aplica al hidratar.
 */
const suscribirUrl = (alCambiar: () => void) => {
  window.addEventListener("popstate", alCambiar);
  return () => window.removeEventListener("popstate", alCambiar);
};
const leerUrlCliente = () => new URLSearchParams(window.location.search).get("variante");
const leerUrlServidor = () => null;

function useVarianteDeUrl() {
  return useSyncExternalStore(suscribirUrl, leerUrlCliente, leerUrlServidor);
}

export function ProveedorVariante({
  detalle,
  children,
}: {
  detalle: DetalleVista;
  children: React.ReactNode;
}) {
  /*
   * La selección se deriva, no se corrige.
   *
   * Mientras nadie toque el configurador manda la URL (o la primera variante
   * con stock si no pide ninguna); en cuanto se elige algo, esa elección pisa
   * a la URL. Derivarla en vez de guardarla y arreglarla después evita un
   * `setState` dentro de un efecto y un repintado extra al abrir la ficha.
   *
   * Se lee de `window.location` y no con `useSearchParams()` porque ese hook
   * suspende durante el prerender, y esta página se pre-construye.
   */
  const varianteDeUrl = useVarianteDeUrl();
  const [eleccionManual, setEleccionManual] = useState<Seleccion | null>(null);

  const seleccion = useMemo<Seleccion>(() => {
    if (eleccionManual) return eleccionManual;
    const inicial = varianteInicial(detalle, varianteDeUrl);
    return inicial ? seleccionDeVariante(detalle, inicial) : {};
  }, [eleccionManual, detalle, varianteDeUrl]);

  const valor = useMemo<ValorContexto>(
    () => ({
      seleccion,
      // Parten de la selección ya derivada, no del estado en bruto: hasta el
      // primer clic ese estado es null y no habría de dónde copiar el resto
      // de las opciones elegidas.
      elegir: (clave, valorId) => setEleccionManual({ ...seleccion, [clave]: valorId }),
      seleccionarVariante: (varianteId) => {
        const destino = detalle.variantes.find((variante) => variante.id === varianteId);
        if (destino) setEleccionManual(seleccionDeVariante(detalle, destino));
      },
      variante: buscarVariante(detalle, seleccion),
      detalle,
    }),
    [detalle, seleccion],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/**
 * Devuelve null fuera de la ficha de producto. La galería se usa siempre
 * dentro del proveedor, pero tolerarlo la deja reutilizable en cualquier otra
 * pantalla sin arrastrar el contexto.
 */
export function useVarianteOpcional() {
  return useContext(Contexto);
}

export function useVariante() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("Falta <ProveedorVariante> encima de este componente");
  return valor;
}
