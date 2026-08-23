import { z } from "zod";

// Los formularios mandan "" en los campos opcionales que quedaron vacíos;
// esto lo convierte en undefined antes de validar.
const opcional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((valor) => (valor === "" || valor === null ? undefined : valor), schema.optional());

export const imagenSchema = z.object({
  url: z.url("La imagen no tiene una URL válida"),
  publicId: z.string().min(1),
});

export const varianteSchema = z.object({
  // Sin id = variante nueva; con id = variante existente que se actualiza.
  id: opcional(z.string().uuid()),
  talla: z.string().min(1, "La talla es obligatoria"),
  color: z.string().default(""),
  sku: z.string().min(1, "Cada variante necesita su propio SKU"),
  precio: opcional(z.coerce.number().positive("El precio de la variante debe ser mayor a 0")),
  cantidad: z.coerce.number().int().min(0, "La cantidad no puede ser negativa"),
  stockMinimo: z.coerce.number().int().min(0, "El mínimo no puede ser negativo"),
  activo: z.boolean().default(true),
});

export const productoSchema = z.object({
  nombre: z.string().min(3, "El nombre es muy corto"),
  slug: z.string().min(3, "El slug es muy corto"),
  descripcion: z.string().min(10, "Agrega una descripción más completa"),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  precioOferta: opcional(z.coerce.number().positive("El precio de oferta debe ser mayor a 0")),
  sku: z.string().min(1, "El SKU es obligatorio"),
  categoriaId: z.string().uuid("Selecciona una categoría"),
  marcaId: opcional(z.string().uuid("Selecciona una marca válida")),
  material: opcional(z.string()),
  cuidados: opcional(z.string()),
  guiaTallas: opcional(z.string()),
  activo: z.boolean().default(true),
  destacado: z.boolean().default(false),
  variantes: z
    .array(varianteSchema)
    .min(1, "Agrega al menos una talla; es lo que realmente se vende"),
  imagenes: z.array(imagenSchema).default([]),
});

export const categoriaSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  slug: z.string().min(2, "El slug es muy corto"),
  descripcion: opcional(z.string()),
  imagenUrl: opcional(z.url("La imagen debe ser una URL válida")),
  padreId: opcional(z.string().uuid("Selecciona una categoría padre válida")),
  activo: z.boolean().default(true),
});

export const marcaSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  slug: z.string().min(2, "El slug es muy corto"),
  logoUrl: opcional(z.url("El logo debe ser una URL válida")),
  activo: z.boolean().default(true),
});

// Edición rápida de inventario desde la pantalla de stock.
export const ajusteStockSchema = z.object({
  cantidad: z.coerce.number().int().min(0, "La cantidad no puede ser negativa"),
  stockMinimo: z.coerce.number().int().min(0, "El mínimo no puede ser negativo"),
});

// z.input (no z.infer) porque los formularios mandan los números y opcionales
// como texto; la coerción y los valores por defecto se aplican al validar.
export type ProductoInput = z.input<typeof productoSchema>;
export type VarianteInput = z.input<typeof varianteSchema>;
export type ImagenInput = z.input<typeof imagenSchema>;
export type CategoriaInput = z.input<typeof categoriaSchema>;
export type MarcaInput = z.input<typeof marcaSchema>;
export type AjusteStockInput = z.input<typeof ajusteStockSchema>;
