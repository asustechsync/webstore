/**
 * DATOS DE EJEMPLO. Se reemplazan por `@webstore/catalog` (paso 2 de la hoja de ruta).
 * Mientras tanto permiten construir y revisar la portada.
 */
export type GarmentKind = "boxer" | "sock" | "tee";

export interface SampleProduct {
  id: string;
  name: string;
  kind: GarmentKind;
  /** Color de la prenda (dato del producto, no del tema). */
  color: string;
  price: number;
  oldPrice?: number;
  rating: number;
  sold: number;
  /** Unidades totales de la oferta (para la barra de avance). Opcional. */
  stock?: number;
  badge?: "Nuevo" | "Agotado";
  favorite?: boolean;
}

export const dealProducts: SampleProduct[] = [
  { id: "d1", name: "Boxer clásico pima", kind: "boxer", color: "#2f3d55", price: 29, oldPrice: 39, rating: 4.9, sold: 652, stock: 900 },
  { id: "d2", name: "Media tobillera x5", kind: "sock", color: "#d9c3a3", price: 39, oldPrice: 55, rating: 4.9, sold: 412 },
  { id: "d3", name: "Boxer largo sin etiqueta", kind: "boxer", color: "#8a9a7b", price: 35, oldPrice: 45, rating: 4.8, sold: 901, favorite: true },
  { id: "d4", name: "Camiseta cuello redondo", kind: "tee", color: "#ffffff", price: 45, oldPrice: 60, rating: 4.9, sold: 516 },
  { id: "d5", name: "Media clásica negra", kind: "sock", color: "#111111", price: 15, oldPrice: 20, rating: 4.9, sold: 129 },
];

export const gridProducts: SampleProduct[] = [
  { id: "g1", name: "Boxer corto azul noche", kind: "boxer", color: "#2f3d55", price: 39, oldPrice: 45, rating: 4.9, sold: 12, badge: "Nuevo" },
  { id: "g2", name: "Boxer largo gris piedra", kind: "boxer", color: "#b9b9b4", price: 42, oldPrice: 49, rating: 4.9, sold: 8, badge: "Nuevo" },
  { id: "g3", name: "Camiseta básica hueso", kind: "tee", color: "#e9e1cf", price: 55, oldPrice: 65, rating: 4.7, sold: 321 },
  { id: "g4", name: "Boxer corto negro", kind: "boxer", color: "#111111", price: 39, oldPrice: 45, rating: 4.9, sold: 281 },
  { id: "g5", name: "Camiseta terracota", kind: "tee", color: "#b5532f", price: 55, oldPrice: 65, rating: 4.8, sold: 98 },
  { id: "g6", name: "Media clásica azul noche", kind: "sock", color: "#1d2b44", price: 15, oldPrice: 20, rating: 4.9, sold: 17, badge: "Nuevo", favorite: true },
  { id: "g7", name: "Boxer rosa edición limitada", kind: "boxer", color: "#f1b6c4", price: 45, rating: 4.9, sold: 120, badge: "Agotado" },
  { id: "g8", name: "Camiseta verde salvia", kind: "tee", color: "#8a9a7b", price: 55, oldPrice: 65, rating: 4.8, sold: 64, favorite: true },
  { id: "g9", name: "Media clásica gris piedra", kind: "sock", color: "#b9b9b4", price: 15, oldPrice: 20, rating: 4.8, sold: 42 },
  { id: "g10", name: "Boxer largo negro", kind: "boxer", color: "#111111", price: 42, oldPrice: 49, rating: 4.9, sold: 87 },
];

export interface SampleCollection {
  id: string;
  name: string;
  reviews: string;
  items: { kind: GarmentKind; color: string }[];
}

export const collections: SampleCollection[] = [
  {
    id: "pima",
    name: "Pima Esencial",
    reviews: "1.2 mil reseñas",
    items: [
      { kind: "boxer", color: "#2f3d55" },
      { kind: "boxer", color: "#111111" },
      { kind: "tee", color: "#e9e1cf" },
      { kind: "boxer", color: "#8a9a7b" },
    ],
  },
  {
    id: "diario",
    name: "Diario",
    reviews: "960 reseñas",
    items: [
      { kind: "sock", color: "#d9c3a3" },
      { kind: "sock", color: "#111111" },
      { kind: "sock", color: "#1d2b44" },
      { kind: "sock", color: "#8a9a7b" },
    ],
  },
  {
    id: "termico",
    name: "Térmico",
    reviews: "540 reseñas",
    items: [
      { kind: "tee", color: "#b9b9b4" },
      { kind: "tee", color: "#b5532f" },
      { kind: "tee", color: "#2f3d55" },
      { kind: "tee", color: "#ffffff" },
    ],
  },
];

/** Colores disponibles de ejemplo (luego vienen de las variantes del producto). */
export const colorOptions = ["#2f3d55", "#111111", "#b9b9b4", "#8a9a7b", "#b5532f", "#f1b6c4"];

export const formatPrice = (value: number) => `S/ ${value.toLocaleString("es-PE")}`;
