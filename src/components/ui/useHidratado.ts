"use client";

import { useSyncExternalStore } from "react";

// Nada a lo que suscribirse: el valor cambia una sola vez, al hidratar.
const suscribir = () => () => {};
const enCliente = () => true;
const enServidor = () => false;

/**
 * `false` mientras se renderiza en el servidor y en el primer pintado;
 * `true` una vez hidratado.
 *
 * Sirve para los valores que solo puede conocer el navegador (la fecha de
 * hoy, algo de `window`) sin provocar un desajuste de hidratación: ambos
 * lados renderizan igual y el valor real entra después.
 *
 * Es el mismo mecanismo que [useCarritoHidratado], que resuelve lo propio
 * para el carrito guardado en localStorage.
 */
export function useHidratado() {
  return useSyncExternalStore(suscribir, enCliente, enServidor);
}
