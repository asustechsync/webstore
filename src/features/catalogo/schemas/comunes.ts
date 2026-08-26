import { z } from "zod";

/** Convierte los valores vacíos de formularios HTML en campos opcionales. */
export const opcional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (valor) => (valor === "" || valor === null ? undefined : valor),
    schema.optional(),
  );
