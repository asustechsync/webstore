import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export class NoAutorizadoError extends Error {
  constructor(mensaje = "No autorizado") {
    super(mensaje);
    this.name = "NoAutorizadoError";
  }
}

// Sesión actual + perfil mínimo para renderizar layouts y navegación.
// cache() de React: si en el mismo request se llama varias veces (layout +
// Header + la página, por ejemplo), solo se consulta la base de datos una vez.
export const getUsuarioActual = cache(async () => {
  const supabase = await createClient();
  // getClaims() verifica la firma del JWT localmente (clave asimétrica del
  // proyecto) — sin llamar a la API de Supabase, a diferencia de getUser().
  const { data } = await supabase.auth.getClaims();

  if (!data) return null;

  return db.usuario.findUnique({
    where: { authId: data.claims.sub },
    // Esta función se invoca en layouts y cabeceras; traer solo lo que usan
    // la navegación y la autorización reduce el trabajo y datos transferidos.
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });
});

// Lanza si no hay sesión o si el usuario no tiene el permiso indicado.
// Uso: al inicio de cada server action / layout de admin protegido.
/** Igual que getUsuarioActual, pero exige sesión. */
export async function requireUsuarioActual() {
  const usuario = await getUsuarioActual();
  if (!usuario) throw new NoAutorizadoError("Debes iniciar sesión");
  return usuario;
}

export async function requirePermiso(clave: string) {
  return requireAlgunPermiso(clave);
}

// Igual que requirePermiso pero basta con tener uno de los permisos: sirve
// para acciones compartidas entre flujos (subir una foto vale tanto al crear
// un producto como al editarlo).
export async function requireAlgunPermiso(...claves: string[]) {
  const usuario = await getUsuarioActual();
  if (!usuario) throw new NoAutorizadoError("Debes iniciar sesión");

  // Los permisos completos no se cargan al abrir una página. En una operación
  // sensible se consulta únicamente el permiso que esa operación necesita.
  const permiso = await db.rolPermiso.findFirst({
    where: {
      rolId: usuario.rol.id,
      permiso: { clave: { in: claves } },
    },
    select: { permisoId: true },
  });
  if (!permiso) throw new NoAutorizadoError("No tienes permiso para esta acción");

  return usuario;
}
