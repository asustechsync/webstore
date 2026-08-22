import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ItemCarrito = {
  productoId: string;
  nombre: string;
  slug: string;
  precio: number;
  imagenUrl: string | null;
  cantidad: number;
};

type EstadoCarrito = {
  items: ItemCarrito[];
  agregarItem: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  quitarItem: (productoId: string) => void;
  vaciar: () => void;
};

export const useCartStore = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      agregarItem: (item, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find((i) => i.productoId === item.productoId);
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.productoId === item.productoId
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i,
              ),
            };
          }
          return { items: [...estado.items, { ...item, cantidad }] };
        }),
      actualizarCantidad: (productoId, cantidad) =>
        set((estado) => ({
          items: estado.items.map((i) =>
            i.productoId === productoId ? { ...i, cantidad } : i,
          ),
        })),
      quitarItem: (productoId) =>
        set((estado) => ({
          items: estado.items.filter((i) => i.productoId !== productoId),
        })),
      vaciar: () => set({ items: [] }),
    }),
    { name: "carrito" },
  ),
);
