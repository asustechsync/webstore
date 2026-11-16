import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "./env";
import type { Database } from "./types";

/**
 * Cliente para componentes del navegador ("use client").
 * Usa solo la anon key: la seguridad real la imponen las políticas RLS.
 */
export function createSupabaseBrowserClient() {
  const env = getPublicSupabaseEnv();
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
