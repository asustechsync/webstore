import { slugificar } from "@/lib/utils";

export type OpcionConfig = {
  clave: string;
  nombre: string;
  tipo?: "LISTA" | "COLOR";
  /** Marca interna: esta opción proviene de Atributos del catálogo. */
  catalogo?: boolean;
  valoresHex?: Record<string, string>;
  /** Valores que se muestran como selección rápida, sin obligar a usarlos. */
  sugeridos?: string[];
  valores: string[];
};

export type AtributoVariante = {
  clave: string;
  valor: string;
};

// Compatibilidad visual para valores de color antiguos que todavía no tienen
// colorHex guardado. Los valores nuevos siguen usando siempre su hex de BD.
export const COLORES_POR_NOMBRE: Record<string, string> = {
  negro: "#171717",
  blanco: "#FFFFFF",
  gris: "#9CA3AF",
  plomo: "#6B7280",
  azul: "#2563EB",
  rojo: "#DC2626",
  rosado: "#EC4899",
  verde: "#16A34A",
  amarillo: "#FACC15",
  beige: "#D6B98C",
  marron: "#92400E",
  morado: "#7C3AED",
};

export type PerfilOpciones = {
  clave: string;
  nombre: string;
  tipoProducto: string;
  opciones: OpcionConfig[];
};

/**
 * Códigos con los que arranca el SKU del producto. Vive acá y no dentro de la
 * server action para que el formulario muestre exactamente el mismo catálogo
 * que después valida el servidor.
 */
export const CODIGOS_TIPO = [
  { codigo: "ME", nombre: "Media", tipoProducto: "MEDIAS_MUJER", perfil: "medias_mujer" },
  { codigo: "BO", nombre: "Boxer", tipoProducto: "BOXER_ADULTO", perfil: "boxer_adulto" },
  { codigo: "PR", nombre: "Prenda (polo, bividí)", tipoProducto: "ROPA_ADULTO", perfil: "ropa_adulto" },
  { codigo: "BR", nombre: "Brasier", tipoProducto: "BRASIER", perfil: "brasier" },
  { codigo: "OT", nombre: "Otro", tipoProducto: "PERSONALIZADO", perfil: "personalizado" },
] as const;

export type CodigoTipo = (typeof CODIGOS_TIPO)[number]["codigo"];

export function definicionCodigoTipo(codigo: string) {
  return CODIGOS_TIPO.find((tipo) => tipo.codigo === codigo) ?? CODIGOS_TIPO[CODIGOS_TIPO.length - 1];
}

export type TipoEditor = "unica" | "media" | "boxer" | "prenda" | "brasier" | "personalizado";
export type PublicoEditor = "mujer" | "hombre" | "nino" | "adulto";

/**
 * Estos tipos son los que ve quien administra la tienda. Los perfiles se
 * mantienen como una implementación interna para poder cargar rápidamente
 * las opciones correctas según tipo y público.
 */
export const TIPOS_EDITOR: Array<{ clave: TipoEditor; nombre: string; publicos?: PublicoEditor[] }> = [
  { clave: "unica", nombre: "Sin talla" },
  { clave: "media", nombre: "Media", publicos: ["mujer", "hombre", "nino"] },
  { clave: "boxer", nombre: "Boxer", publicos: ["adulto", "nino"] },
  { clave: "prenda", nombre: "Polo / Bividí", publicos: ["adulto", "nino"] },
  { clave: "brasier", nombre: "Brasier" },
  { clave: "personalizado", nombre: "Otro / personalizado" },
];

export const NOMBRES_PUBLICO: Record<PublicoEditor, string> = {
  mujer: "Mujer",
  hombre: "Hombre",
  nino: "Niño",
  adulto: "Adulto",
};

export const COLORES_BASICOS = [
  { nombre: "Negro", hex: "#171717" },
  { nombre: "Blanco", hex: "#FFFFFF" },
  { nombre: "Gris", hex: "#9CA3AF" },
  { nombre: "Plomo", hex: "#6B7280" },
  { nombre: "Azul", hex: "#2563EB" },
  { nombre: "Rojo", hex: "#DC2626" },
  { nombre: "Rosado", hex: "#EC4899" },
  { nombre: "Verde", hex: "#16A34A" },
  { nombre: "Amarillo", hex: "#FACC15" },
  { nombre: "Beige", hex: "#D6B98C" },
  { nombre: "Marrón", hex: "#92400E" },
  { nombre: "Morado", hex: "#7C3AED" },
] as const;

export const PERFILES_OPCIONES: PerfilOpciones[] = [
  {
    clave: "unica",
    nombre: "Talla única",
    tipoProducto: "GENERAL",
    opciones: [{ clave: "talla", nombre: "Talla", sugeridos: ["Única"], valores: [] }],
  },
  {
    clave: "medias_mujer",
    nombre: "Medias mujer",
    tipoProducto: "MEDIAS_MUJER",
    opciones: [
      // Una media normalmente se vende como rango, no como seis variantes.
      // Se puede agregar otra talla o rango desde el formulario si el producto lo requiere.
      { clave: "talla", nombre: "Talla", sugeridos: ["35–40"], valores: [] },
      { clave: "color", nombre: "Color", sugeridos: ["Negro", "Blanco", "Gris", "Azul", "Rojo", "Rosado"], valores: [] },
      { clave: "diseno", nombre: "Diseño", sugeridos: ["Lisa", "Rayas", "Puntos", "Flores", "Caricatura", "Estampado"], valores: [] },
    ],
  },
  {
    clave: "medias_hombre",
    nombre: "Medias hombre",
    tipoProducto: "MEDIAS_HOMBRE",
    opciones: [
      { clave: "talla", nombre: "Talla", sugeridos: ["40–45"], valores: [] },
      { clave: "color", nombre: "Color", sugeridos: ["Negro", "Blanco", "Gris", "Azul", "Rojo"], valores: [] },
      { clave: "diseno", nombre: "Diseño", sugeridos: ["Lisa", "Rayas", "Deportivo", "Caricatura", "Estampado"], valores: [] },
    ],
  },
  {
    clave: "medias_nino",
    nombre: "Medias niño",
    tipoProducto: "MEDIAS_NINO",
    opciones: [
      { clave: "edad", nombre: "Edad/Talla", sugeridos: ["4", "6", "8", "10", "12"], valores: [] },
      { clave: "color", nombre: "Color", sugeridos: ["Negro", "Blanco", "Gris", "Azul", "Rosado"], valores: [] },
      { clave: "diseno", nombre: "Diseño", sugeridos: ["Lisa", "Animalitos", "Personajes", "Caricatura", "Estampado"], valores: [] },
    ],
  },
  {
    clave: "ropa_adulto",
    nombre: "Ropa adulto",
    tipoProducto: "ROPA_ADULTO",
    opciones: [
      { clave: "talla", nombre: "Talla", sugeridos: ["S", "M", "L", "XL", "XXL", "XXXL"], valores: [] },
      { clave: "color", nombre: "Color", sugeridos: ["Negro", "Blanco", "Gris", "Azul", "Rojo"], valores: [] },
      { clave: "diseno", nombre: "Diseño", sugeridos: ["Liso", "Rayas", "Deportivo", "Estampado", "Caricatura"], valores: [] },
    ],
  },
  {
    clave: "ropa_nino",
    nombre: "Ropa niño",
    tipoProducto: "ROPA_NINO",
    opciones: [
      { clave: "talla", nombre: "Talla", sugeridos: ["4", "6", "8", "10", "12", "14", "16"], valores: [] },
      { clave: "color", nombre: "Color", sugeridos: ["Negro", "Blanco", "Gris", "Azul", "Rosado"], valores: [] },
      { clave: "diseno", nombre: "Diseño", sugeridos: ["Liso", "Animalitos", "Personajes", "Caricatura", "Estampado"], valores: [] },
    ],
  },
  {
    clave: "boxer_adulto",
    nombre: "Boxer adulto",
    tipoProducto: "BOXER_ADULTO",
    opciones: [
      { clave: "talla", nombre: "Talla", sugeridos: ["S", "M", "L", "XL", "XXL", "XXXL"], valores: [] },
      { clave: "color", nombre: "Color", sugeridos: ["Negro", "Blanco", "Gris", "Azul", "Rojo"], valores: [] },
      { clave: "diseno", nombre: "Diseño", sugeridos: ["Liso", "Rayas", "Deportivo", "Estampado", "Caricatura"], valores: [] },
    ],
  },
  {
    clave: "boxer_nino",
    nombre: "Boxer niño",
    tipoProducto: "BOXER_NINO",
    opciones: [
      { clave: "talla", nombre: "Talla", sugeridos: ["10", "12", "14", "16"], valores: [] },
      { clave: "color", nombre: "Color", sugeridos: ["Negro", "Blanco", "Gris", "Azul", "Rosado"], valores: [] },
      { clave: "diseno", nombre: "Diseño", sugeridos: ["Liso", "Animalitos", "Personajes", "Caricatura", "Estampado"], valores: [] },
    ],
  },
  {
    clave: "brasier",
    nombre: "Brasier",
    tipoProducto: "BRASIER",
    opciones: [
      { clave: "contorno", nombre: "Contorno", sugeridos: ["32", "34", "36", "38", "40"], valores: [] },
      { clave: "copa", nombre: "Copa", sugeridos: ["A", "B", "C", "D"], valores: [] },
      { clave: "color", nombre: "Color", sugeridos: ["Negro", "Blanco", "Beige", "Rojo"], valores: [] },
      { clave: "diseno", nombre: "Diseño", sugeridos: ["Liso", "Encaje", "Floral", "Estampado"], valores: [] },
    ],
  },
  {
    clave: "personalizado",
    nombre: "Personalizado",
    tipoProducto: "PERSONALIZADO",
    opciones: [{ clave: "talla", nombre: "Talla", valores: [] }],
  },
];

const PERFIL_POR_TIPO: Record<TipoEditor, Partial<Record<PublicoEditor, string>> & { predeterminado?: string }> = {
  unica: { predeterminado: "unica" },
  media: { mujer: "medias_mujer", hombre: "medias_hombre", nino: "medias_nino" },
  boxer: { adulto: "boxer_adulto", nino: "boxer_nino" },
  prenda: { adulto: "ropa_adulto", nino: "ropa_nino" },
  brasier: { predeterminado: "brasier" },
  personalizado: { predeterminado: "personalizado" },
};

export function contextoDesdePerfil(perfil: string): { tipo: TipoEditor; publico?: PublicoEditor } {
  for (const [tipo, publicos] of Object.entries(PERFIL_POR_TIPO) as Array<[TipoEditor, typeof PERFIL_POR_TIPO[TipoEditor]]>) {
    if (publicos.predeterminado === perfil) return { tipo };
    const publico = (Object.keys(NOMBRES_PUBLICO) as PublicoEditor[]).find((clave) => publicos[clave] === perfil);
    if (publico) return { tipo, publico };
  }
  return { tipo: "personalizado" };
}

export function perfilParaTipo(tipo: TipoEditor, publico?: PublicoEditor) {
  const perfiles = PERFIL_POR_TIPO[tipo];
  return perfiles[publico ?? "adulto"] ?? perfiles.predeterminado ?? "personalizado";
}

export function normalizarClaveOpcion(nombre: string) {
  return slugificar(nombre).replaceAll("-", "_") || "opcion";
}

export function claveAtributos(atributos: AtributoVariante[]) {
  return [...atributos]
    .sort((a, b) => a.clave.localeCompare(b.clave))
    .map(({ clave, valor }) => `${clave}=${valor.trim().toLocaleLowerCase("es")}`)
    .join("|");
}

export function etiquetaAtributos(atributos: AtributoVariante[]) {
  return atributos.map(({ valor }) => valor).filter(Boolean).join(" / ") || "Única";
}

export function combinacionesOpciones(opciones: OpcionConfig[]): AtributoVariante[][] {
  const configuradas = opciones.filter((opcion) => opcion.valores.length > 0);
  if (configuradas.length === 0) return [];

  return configuradas.reduce<AtributoVariante[][]>(
    (combinaciones, opcion) =>
      combinaciones.flatMap((combinacion) =>
        opcion.valores.map((valor) => [...combinacion, { clave: opcion.clave, valor }]),
      ),
    [[]],
  );
}

export function obtenerAtributo(atributos: AtributoVariante[], clave: string) {
  return atributos.find((atributo) => atributo.clave === clave)?.valor ?? "";
}
