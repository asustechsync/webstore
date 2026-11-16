import { z } from "zod";

/**
 * Variables públicas de Supabase. Se validan al crear un cliente, no al importar,
 * para que las apps compilen aunque todavía no se haya configurado Supabase.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({ error: "NEXT_PUBLIC_SUPABASE_URL debe ser una URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, { error: "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY" }),
});

export function getPublicSupabaseEnv() {
  // Acceso explícito a cada variable para que Next.js las inyecte en el navegador.
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    throw new Error(
      `Configuración de Supabase inválida: ${parsed.error.issues.map((i) => i.message).join("; ")}. Revisa .env.example.`,
    );
  }
  return parsed.data;
}
