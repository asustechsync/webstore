import { z } from "zod";

/**
 * Ids de variante que el carrito manda a revisar. El límite acota el tamaño
 * de la consulta: el carrito nunca lleva tantas líneas distintas.
 */
export const varianteIdsSchema = z
  .array(z.uuid("Producto inválido"))
  .min(1, "No hay nada que revisar")
  .max(60, "Tu carrito tiene demasiados productos distintos");
