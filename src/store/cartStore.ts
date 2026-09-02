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

/**
 * Copia del carrito antes de una acción destructiva. Con ella el botón
 * "Deshacer" devuelve todo tal cual estaba, incluidos el cupón y la marca de
 * qué líneas se iban a pagar.
 */
export type FotoCarrito = {
  items: ItemCarrito[];
  /** Líneas apartadas con "guardar para después": no suman al total. */
  guardados: ItemCarrito[];
  /**
   * Variantes marcadas para pagar. Solo estas cuentan en el total y viajan al
   * checkout; el resto se queda en el carrito para otra compra.
   */
  seleccionados: string[];
  /**
   * Cupón validado por el servidor. Se guarda solo lo necesario para volver a
   * calcular el descuento cuando cambian las cantidades; quién puede usarlo lo
   * decide siempre el servidor.
   */
  cupon: CuponAplicado | null;
};

type EstadoCarrito = FotoCarrito & {
  agregarItem: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  actualizarCantidad: (varianteId: string, cantidad: number) => void;
  quitarItem: (varianteId: string) => void;
  /** Quita varias líneas de una vez: acciones en lote y compra terminada. */
  quitarItems: (varianteIds: string[]) => void;
  /** Deja el carrito con estas líneas; lo usa la revisión contra el catálogo. */
  reemplazarItems: (items: ItemCarrito[]) => void;
  alternarSeleccion: (varianteId: string) => void;
  seleccionarTodo: (marcarTodo: boolean) => void;
  guardarParaDespues: (varianteId: string) => void;
  guardarVarios: (varianteIds: string[]) => void;
  moverAlCarrito: (varianteId: string) => void;
  quitarGuardado: (varianteId: string) => void;
  aplicarCupon: (cupon: CuponAplicado) => void;
  quitarCupon: () => void;
  restaurar: (foto: FotoCarrito) => void;
};

function limitar(cantidad: number) {
  return Math.min(Math.max(Math.trunc(cantidad), 1), CANTIDAD_MAXIMA);
}

/** Suma la cantidad si la variante ya estaba en la lista; si no, la agrega. */
function acumular(lista: ItemCarrito[], nuevo: ItemCarrito) {
  const existente = lista.find((item) => item.varianteId === nuevo.varianteId);
  if (!existente) return [...lista, nuevo];
  return lista.map((item) =>
    item.varianteId === nuevo.varianteId
      ? { ...item, cantidad: limitar(item.cantidad + nuevo.cantidad) }
      : item,
  );
}

function marcar(seleccionados: string[], varianteId: string) {
  return seleccionados.includes(varianteId) ? seleccionados : [...seleccionados, varianteId];
}

function desmarcar(seleccionados: string[], varianteIds: string[]) {
  return seleccionados.filter((id) => !varianteIds.includes(id));
}

export const useCartStore = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      guardados: [],
      seleccionados: [],
      cupon: null,
      // Lo que se acaba de agregar entra marcado: agregar al carrito ya es
      // decir "esto lo quiero comprar".
      agregarItem: (item, cantidad = 1) =>
        set((estado) => ({
          items: acumular(estado.items, { ...item, cantidad: limitar(cantidad) }),
          seleccionados: marcar(estado.seleccionados, item.varianteId),
        })),
      actualizarCantidad: (varianteId, cantidad) =>
        set((estado) => ({
          items: estado.items.map((i) =>
            i.varianteId === varianteId ? { ...i, cantidad: limitar(cantidad) } : i,
          ),
        })),
      quitarItem: (varianteId) =>
        set((estado) => ({
          items: estado.items.filter((i) => i.varianteId !== varianteId),
          seleccionados: desmarcar(estado.seleccionados, [varianteId]),
        })),
      quitarItems: (varianteIds) =>
        set((estado) => ({
          items: estado.items.filter((i) => !varianteIds.includes(i.varianteId)),
          seleccionados: desmarcar(estado.seleccionados, varianteIds),
        })),
      reemplazarItems: (items) =>
        set((estado) => ({
          items,
          // Lo que la revisión sacó del carrito deja de estar marcado.
          seleccionados: estado.seleccionados.filter((id) =>
            items.some((item) => item.varianteId === id),
          ),
        })),
      alternarSeleccion: (varianteId) =>
        set((estado) => ({
          seleccionados: estado.seleccionados.includes(varianteId)
            ? desmarcar(estado.seleccionados, [varianteId])
            : marcar(estado.seleccionados, varianteId),
        })),
      seleccionarTodo: (marcarTodo) =>
        set((estado) => ({
          seleccionados: marcarTodo ? estado.items.map((item) => item.varianteId) : [],
        })),
      // Guardar para después saca la línea del total sin perderla: sigue a la
      // vista, con su talla y su color, hasta que se decida.
      guardarParaDespues: (varianteId) =>
        set((estado) => {
          const item = estado.items.find((i) => i.varianteId === varianteId);
          if (!item) return estado;
          return {
            items: estado.items.filter((i) => i.varianteId !== varianteId),
            guardados: acumular(estado.guardados, item),
            seleccionados: desmarcar(estado.seleccionados, [varianteId]),
          };
        }),
      guardarVarios: (varianteIds) =>
        set((estado) => {
          const mover = estado.items.filter((i) => varianteIds.includes(i.varianteId));
          if (mover.length === 0) return estado;
          return {
            items: estado.items.filter((i) => !varianteIds.includes(i.varianteId)),
            guardados: mover.reduce(acumular, estado.guardados),
            seleccionados: desmarcar(estado.seleccionados, varianteIds),
          };
        }),
      moverAlCarrito: (varianteId) =>
        set((estado) => {
          const item = estado.guardados.find((i) => i.varianteId === varianteId);
          if (!item) return estado;
          return {
            items: acumular(estado.items, item),
            guardados: estado.guardados.filter((i) => i.varianteId !== varianteId),
            seleccionados: marcar(estado.seleccionados, varianteId),
          };
        }),
      quitarGuardado: (varianteId) =>
        set((estado) => ({
          guardados: estado.guardados.filter((i) => i.varianteId !== varianteId),
        })),
      aplicarCupon: (cupon) => set({ cupon }),
      quitarCupon: () => set({ cupon: null }),
      restaurar: ({ items, guardados, seleccionados, cupon }) =>
        set({ items, guardados, seleccionados, cupon }),
    }),
    {
      name: "carrito",
      // La versión invalida los carritos guardados con el modelo viejo
      // (por producto), que ya no se pueden resolver contra la base.
      version: 2,
      migrate: () => ({ items: [], guardados: [], seleccionados: [], cupon: null }),
      // Solo datos: las acciones se vuelven a crear en cada carga.
      partialize: ({ items, guardados, seleccionados, cupon }) => ({
        items,
        guardados,
        seleccionados,
        cupon,
      }),
      merge: (guardado, actual) => {
        const previo = guardado as Partial<EstadoCarrito> | undefined;
        const estado = { ...actual, ...previo };
        // Un carrito guardado antes de que existiera la selección llega sin
        // marcas: se abre con todo marcado, como estaba hasta ahora.
        if (!Array.isArray(previo?.seleccionados)) {
          estado.seleccionados = estado.items.map((item) => item.varianteId);
        }
        return estado;
      },
    },
  ),
);

/** Copia del carrito en este instante, para poder deshacer después. */
export function tomarFoto(): FotoCarrito {
  const { items, guardados, seleccionados, cupon } = useCartStore.getState();
  return { items, guardados, seleccionados, cupon };
}

/** Las líneas marcadas: las únicas que suman al total y viajan al checkout. */
export function filtrarSeleccionados(items: ItemCarrito[], seleccionados: string[]) {
  return items.filter((item) => seleccionados.includes(item.varianteId));
}

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
