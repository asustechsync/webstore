import { z } from "zod";

export const ajusteStockSchema = z.object({
  cantidad: z.coerce.number().int().min(0, "La cantidad no puede ser negativa"),
  stockMinimo: z.coerce.number().int().min(0, "El mínimo no puede ser negativo"),
});

export type AjusteStockInput = z.input<typeof ajusteStockSchema>;
