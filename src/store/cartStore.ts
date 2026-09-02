import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calcularDescuentoCupon, type CuponAplicado } from "@/features/cupones/calculo";

// El carrito guarda la variante (talla/color), no el producto: es la unidad
// que realmente tiene stock y precio.
export type ItemCarrito = {
  varianteId: string;
  productoId: string;
  nombre: string;
  slug: string;
  talla: string;
  color: string;
  precio: number;
  imagenUrl: string | null;
  cantidad: number;
};

/** Tope por línea mientras el carrito no conoce el stock de la variante. */
export const CANTIDAD_MAXIMA = 99;

type EstadoCarrito = {
  items: ItemCarrito[];
  /**
   * Cupón validado por el servidor. Se guarda solo lo necesario para volver a
   * calcular el descuento cuando cambian las cantidades; quién puede usarlo lo
   * decide siempre el servidor.
   */
  cupon: CuponAplicado | null;
  agregarItem: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  actualizarCantidad: (varianteId: string, cantidad: number) => void;
  quitarItem: (varianteId: string) => void;
  aplicarCupon: (cupon: CuponAplicado) => void;
  quitarCupon: () => void;
  vaciar: () => void;
};

function limitar(cantidad: number) {
  return Math.min(Math.max(Math.trunc(cantidad), 1), CANTIDAD_MAXIMA);
}

export const useCartStore = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      cupon: null,
      agregarItem: (item, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find((i) => i.varianteId === item.varianteId);
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.varianteId === item.varianteId
                  ? { ...i, cantidad: limitar(i.cantidad + cantidad) }
                  : i,
              ),
            };
          }
          return { items: [...estado.items, { ...item, cantidad: limitar(cantidad) }] };
        }),
      actualizarCantidad: (varianteId, cantidad) =>
        set((estado) => ({
          items: estado.items.map((i) =>
            i.varianteId === varianteId ? { ...i, cantidad: limitar(cantidad) } : i,
          ),
        })),
      quitarItem: (varianteId) =>
        set((estado) => ({
          items: estado.items.filter((i) => i.varianteId !== varianteId),
        })),
      aplicarCupon: (cupon) => set({ cupon }),
      quitarCupon: () => set({ cupon: null }),
      vaciar: () => set({ items: [], cupon: null }),
    }),
    // La versión invalida los carritos guardados con el modelo viejo
    // (por producto), que ya no se pueden resolver contra la base.
    { name: "carrito", version: 2, migrate: () => ({ items: [], cupon: null }) },
  ),
);

/** Unidades totales; lo usa el indicador del encabezado. */
export function contarUnidades(items: ItemCarrito[]) {
  return items.reduce((total, item) => total + item.cantidad, 0);
}

/** Suma de los productos, sin envío ni cupones. */
export function calcularSubtotal(items: ItemCarrito[]) {
  return items.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

/** Descuento vigente del cupón guardado; 0 si no hay o no llega al mínimo. */
export function calcularDescuento(cupon: CuponAplicado | null, subtotal: number) {
  return cupon ? calcularDescuentoCupon(cupon, subtotal) : 0;
}

/** Lo que se cobra: subtotal menos el descuento, nunca por debajo de 0. */
export function calcularTotal(items: ItemCarrito[], cupon: CuponAplicado | null) {
  const subtotal = calcularSubtotal(items);
  return Math.max(subtotal - calcularDescuento(cupon, subtotal), 0);
}
