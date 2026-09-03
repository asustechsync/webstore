import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const rutaProtegida =
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/cuenta");

  // Se llama en cada request (no solo en rutas protegidas): getClaims() verifica
  // la firma del JWT localmente —sin red mientras el token siga vigente— y, si
  // expiró, refresca la sesión. El proxy es el único punto que refresca porque
  // es el único que puede persistir las cookies nuevas en la respuesta; hacerlo
  // desde un Server Component consume el refresh token sin poder guardarlo y
  // provoca "refresh_token_not_found" en el siguiente request.
  let haySesion = false;
  try {
    const { data } = await supabase.auth.getClaims();
    haySesion = data !== null;
  } catch (error) {
    // Refresh token inválido/rotado: se trata como sesión ausente.
    if ((error as { code?: string }).code !== "refresh_token_not_found") throw error;
  }

  if (rutaProtegida && !haySesion) {
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
