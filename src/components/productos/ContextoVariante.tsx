"use client";

import { createContext, useContext, useMemo, useState } from "react";
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
function varianteInicial(detalle: DetalleVista, varianteId?: string) {
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

export function ProveedorVariante({
  detalle,
  /** Viene de `?variante=` y lo resuelve el servidor, así el HTML ya llega
      con la combinación correcta en vez de corregirla al hidratar. */
  varianteInicialId,
  children,
}: {
  detalle: DetalleVista;
  varianteInicialId?: string;
  children: React.ReactNode;
}) {
  const [seleccion, setSeleccion] = useState<Seleccion>(() => {
    const inicial = varianteInicial(detalle, varianteInicialId);
    return inicial ? seleccionDeVariante(detalle, inicial) : {};
  });

  const valor = useMemo<ValorContexto>(
    () => ({
      seleccion,
      elegir: (clave, valorId) => setSeleccion((actual) => ({ ...actual, [clave]: valorId })),
      seleccionarVariante: (varianteId) => {
        const destino = detalle.variantes.find((variante) => variante.id === varianteId);
        if (destino) setSeleccion(seleccionDeVariante(detalle, destino));
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
