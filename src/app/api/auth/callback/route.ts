import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decodificarClaims } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectToParam = searchParams.get("redirectTo");

  let redirectTo = redirectToParam ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // La fila en `usuarios` la crea un trigger de Postgres apenas Supabase
    // registra la cuenta (ver prisma/trigger_crear_usuario.sql) — no hay
    // nada que sincronizar acá, cero llamadas extra.
    if (data.session && !redirectToParam) {
      // El rol viene incluido en el token (hook de Supabase) — sin consulta extra.
      const claims = decodificarClaims(data.session.access_token);
      redirectTo = claims.user_role === "ADMIN" ? "/admin" : "/cuenta";
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
