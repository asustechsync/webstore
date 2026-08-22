import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con service role: solo para uso interno del servidor
// (ej. crear usuarios desde el panel admin). NUNCA importar desde el cliente.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
