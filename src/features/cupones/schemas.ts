import { z } from "zod";

const opcional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((valor) => (valor === "" || valor === null ? undefined : valor), schema.optional());

export const cuponSchema = z
  .object({
    codigo: z
      .string()
      .min(3, "El código es muy corto")
      .transform((valor) => valor.trim().toUpperCase()),
    tipo: z.enum(["PORCENTAJE", "MONTO_FIJO"]),
    valor: z.coerce.number().positive("El valor debe ser mayor a 0"),
    montoMinimo: opcional(z.coerce.number().min(0, "El monto mínimo no puede ser negativo")),
    usoMaximo: opcional(z.coerce.number().int().positive("El máximo de usos debe ser mayor a 0")),
    fechaInicio: opcional(z.coerce.date()),
    fechaFin: opcional(z.coerce.date()),
    activo: z.boolean().default(true),
  })
  .refine((datos) => datos.tipo !== "PORCENTAJE" || datos.valor <= 100, {
    message: "Un descuento por porcentaje no puede superar 100",
    path: ["valor"],
  })
  .refine(
    (datos) => !datos.fechaInicio || !datos.fechaFin || datos.fechaInicio <= datos.fechaFin,
    { message: "La fecha de inicio debe ser anterior a la de fin", path: ["fechaFin"] },
  );

export type CuponInput = z.input<typeof cuponSchema>;
