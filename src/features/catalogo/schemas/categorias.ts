import { z } from "zod";
import { opcional } from "./comunes";

export const categoriaSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  slug: z.string().min(2, "El slug es muy corto"),
  descripcion: opcional(z.string()),
  imagenUrl: opcional(z.url("La imagen debe ser una URL válida")),
  orden: z.coerce.number().int().min(0, "El orden no puede ser negativo").default(0),
  destacada: z.boolean().default(false),
  tituloSeo: opcional(z.string().max(60, "El título SEO admite hasta 60 caracteres")),
  descripcionSeo: opcional(z.string().max(160, "La descripción SEO admite hasta 160 caracteres")),
  padreId: opcional(z.string().uuid("Selecciona una categoría padre válida")),
  activo: z.boolean().default(true),
});

export type CategoriaInput = z.input<typeof categoriaSchema>;
