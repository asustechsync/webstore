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

// Sesión actual + su fila en `usuarios` (con rol y permisos) desde Supabase Auth.
// cache() de React: si en el mismo request se llama varias veces (layout +
// Header + la página, por ejemplo), solo se consulta la base de datos una vez.
export const getUsuarioActual = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return db.usuario.findUnique({
    where: { authId: user.id },
    include: { rol: { include: { permisos: { include: { permiso: true } } } } },
  });
});

// Lanza si no hay sesión o si el usuario no tiene el permiso indicado.
// Uso: al inicio de cada server action / layout de admin protegido.
export async function requirePermiso(clave: string) {
  const usuario = await getUsuarioActual();
  if (!usuario) throw new NoAutorizadoError("Debes iniciar sesión");

  const tienePermiso = usuario.rol.permisos.some(
    (rp) => rp.permiso.clave === clave,
  );
  if (!tienePermiso) throw new NoAutorizadoError("No tienes permiso para esta acción");

  return usuario;
}
