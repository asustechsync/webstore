"use client";

import { useSyncExternalStore } from "react";
import { useCartStore } from "@/store/cartStore";

// El carrito vive en localStorage, así que el render del servidor siempre lo
// ve vacío. Nos suscribimos al final de la rehidratación de zustand para
// pintar el contenido real recién cuando existe, sin desajustes.
const suscribir = (alCambiar: () => void) => useCartStore.persist.onFinishHydration(alCambiar);
const leerEnCliente = () => useCartStore.persist.hasHydrated();
const leerEnServidor = () => false;

/** Indica si el carrito guardado ya se cargó en el navegador. */
export function useCarritoHidratado() {
  return useSyncExternalStore(suscribir, leerEnCliente, leerEnServidor);
}
