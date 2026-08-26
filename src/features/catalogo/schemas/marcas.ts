import { z } from "zod";
import { opcional } from "./comunes";

export const marcaSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  slug: z.string().min(2, "El slug es muy corto"),
  logoUrl: opcional(z.url("El logo debe ser una URL válida")),
  activo: z.boolean().default(true),
});

export type MarcaInput = z.input<typeof marcaSchema>;
