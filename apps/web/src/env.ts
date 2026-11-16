import { z } from "zod";

/**
 * Variables de entorno de la app web, validadas al arrancar.
 * Si falta o está mal una variable, la app falla de inmediato con un mensaje claro
 * (mejor que fallar en producción en medio de una compra).
 */
const schema = z.object({
  NEXT_PUBLIC_STORE_NAME: z.string().min(1).default("Mi tienda"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

export const env = schema.parse({
  NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
