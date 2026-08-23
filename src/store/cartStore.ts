import { create } from "zustand";
import { persist } from "zustand/middleware";

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

type EstadoCarrito = {
  items: ItemCarrito[];
  agregarItem: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  actualizarCantidad: (varianteId: string, cantidad: number) => void;
  quitarItem: (varianteId: string) => void;
  vaciar: () => void;
};

export const useCartStore = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      agregarItem: (item, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find((i) => i.varianteId === item.varianteId);
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.varianteId === item.varianteId
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i,
              ),
            };
          }
          return { items: [...estado.items, { ...item, cantidad }] };
        }),
      actualizarCantidad: (varianteId, cantidad) =>
        set((estado) => ({
          items: estado.items.map((i) =>
            i.varianteId === varianteId ? { ...i, cantidad } : i,
          ),
        })),
      quitarItem: (varianteId) =>
        set((estado) => ({
          items: estado.items.filter((i) => i.varianteId !== varianteId),
        })),
      vaciar: () => set({ items: [] }),
    }),
    // La versión invalida los carritos guardados con el modelo viejo
    // (por producto), que ya no se pueden resolver contra la base.
    { name: "carrito", version: 2, migrate: () => ({ items: [] }) },
  ),
);
