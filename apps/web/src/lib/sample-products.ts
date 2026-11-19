/**
 * DATOS DE EJEMPLO. Se reemplazan por `@webstore/catalog` (paso 2 de la hoja de ruta).
 * Mientras tanto permiten construir y revisar la portada.
 */
export type GarmentKind = "boxer" | "sock" | "tee";

export interface SampleProduct {
  id: string;
  name: string;
  brand: string;
  kind: GarmentKind;
  /** Color de la prenda (dato del producto, no del tema). */
  color: string;
  /** Colores disponibles (muestras en la card). Si falta, se usa solo `color`. */
  colors?: Array<string | string[]>;
  /** Foto del producto (ruta en /public). Si falta, se dibuja la prenda de ejemplo. */
  image?: string;
  /** La foto trae su propio fondo (no es transparente): se recorta para llenar el recuadro. */
  imageCover?: boolean;
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
  { id: "d1", brand: "Pesail", name: "Boxer clásico pima", kind: "boxer", color: "#2f3d55", price: 18, oldPrice: 22, rating: 4.9, sold: 652, stock: 900 },
  { id: "d2", brand: "Amanecer", name: "Media tobillera x5", kind: "sock", color: "#d9c3a3", price: 22, oldPrice: 25, rating: 4.9, sold: 412 },
  { id: "d3", brand: "Ciervo Dorado", name: "Boxer largo sin etiqueta", kind: "boxer", color: "#8a9a7b", price: 20, oldPrice: 24, rating: 4.8, sold: 901, favorite: true },
  { id: "d4", brand: "Fila", name: "Camiseta cuello redondo", kind: "tee", color: "#ffffff", price: 23, oldPrice: 25, rating: 4.9, sold: 516 },
  { id: "d5", brand: "Boston", name: "Media clásica negra", kind: "sock", color: "#111111", price: 12, oldPrice: 15, rating: 4.9, sold: 129 },
];

export const gridProducts: SampleProduct[] = [
  { id: "g1", brand: "Fila", name: "Boxer estampado geométrico", kind: "boxer", color: "#111111", colors: ["#111111", "#3a4a3a", "#2f3d55"], image: "/productos/boxer-fila-negro.webp", price: 20, oldPrice: 24, rating: 4.9, sold: 12, badge: "Nuevo" },
  { id: "g2", brand: "Fila", name: "Boxer estampado hojas azul", kind: "boxer", color: "#1f6fa8", colors: ["#1f6fa8", "#111111", "#8a9a7b"], image: "/productos/boxer-fila-azul.webp", price: 21, oldPrice: 25, rating: 4.9, sold: 8, badge: "Nuevo" },
  { id: "g3", brand: "Thermic", name: "Media merino caña media x4", kind: "sock", color: "#b9b9b4", colors: [["#7a3b4a", "#c9a67a", "#1f5a5a", "#2f3d55"], ["#d9c3a3", "#b9b9b4", "#111111", "#8a8a8a"], "#111111", ["#b9b9b4", "#111111"], "#2f3d55", "#7a3b4a", "#8a9a7b"], image: "/productos/media-merino-pack.avif", imageCover: true, price: 24, oldPrice: 25, rating: 4.7, sold: 321 },
  { id: "g4", brand: "Ciervo Dorado", name: "Boxer estampado hojas negro", kind: "boxer", color: "#111111", colors: ["#111111", "#b9b9b4"], image: "/productos/boxer-hojas-negro.webp", price: 20, oldPrice: 24, rating: 4.9, sold: 281 },
  { id: "g5", brand: "Thermic", name: "Media estampado leopardo", kind: "sock", color: "#c9a67a", colors: [["#c9a67a", "#e6d5c0", "#7a5a3a", "#111111"], "#111111", ["#b84a6b", "#f4c0d1"]], image: "/productos/media-leopardo.avif", imageCover: true, price: 23, oldPrice: 25, rating: 4.8, sold: 98 },
  { id: "g6", brand: "Thermic", name: "Media morado y rojo", kind: "sock", color: "#8a4a7a", colors: [["#8a4a7a", "#a23a3a", "#c9a67a", "#1f5a5a"], ["#2d5a87", "#b5d4f4"], "#111111"], image: "/productos/media-morado-rojo.avif", imageCover: true, price: 12, oldPrice: 15, rating: 4.9, sold: 17, badge: "Nuevo", favorite: true },
  { id: "g7", brand: "Pesail", name: "Boxer rosa edición limitada", kind: "boxer", color: "#f1b6c4", price: 22, rating: 4.9, sold: 120, badge: "Agotado" },
  { id: "g8", brand: "Ciervo Dorado", name: "Camiseta verde salvia", kind: "tee", color: "#8a9a7b", price: 24, oldPrice: 25, rating: 4.8, sold: 64, favorite: true },
  { id: "g9", brand: "Amanecer", name: "Media negra clásica", kind: "sock", color: "#111111", colors: ["#111111", ["#9a9a9a", "#111111"], "#ffffff", ["#d9c3a3", "#111111"]], image: "/productos/media-negra.avif", imageCover: true, price: 12, oldPrice: 15, rating: 4.8, sold: 42 },
  { id: "g10", brand: "Fila", name: "Boxer largo estampado negro", kind: "boxer", color: "#111111", colors: ["#111111", "#2f3d55"], image: "/productos/boxer-fila-negro.webp", price: 21, oldPrice: 25, rating: 4.9, sold: 87 },
];

export interface SampleCollection {
  id: string;
  name: string;
  brand: string;
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
