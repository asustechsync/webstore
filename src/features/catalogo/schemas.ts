import { z } from "zod";

export const productoSchema = z.object({
  nombre: z.string().min(3, "El nombre es muy corto"),
  slug: z.string().min(3),
  descripcion: z.string().min(10, "Agrega una descripción más completa"),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  precioOferta: z.coerce.number().positive().optional(),
  sku: z.string().min(1, "El SKU es obligatorio"),
  categoriaId: z.string().uuid("Selecciona una categoría"),
  marcaId: z.string().uuid().optional(),
  activo: z.boolean().default(true),
  destacado: z.boolean().default(false),
});

export type ProductoInput = z.infer<typeof productoSchema>;
