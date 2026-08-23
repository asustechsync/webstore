import "server-only";
import { z } from "zod";
import { NoAutorizadoError } from "./auth";

export type Resultado<T = void> =
  | { ok: true; datos: T }
  | { ok: false; error: string };

const MENSAJES_PRISMA: Record<string, string> = {
  P2002: "Ya existe un registro con ese nombre o slug",
  P2003: "No se puede eliminar: hay otros registros que dependen de este",
  P2025: "El registro ya no existe",
};

// Next enmascara las excepciones de las server actions en producción, así que
// los errores esperados (validación, permisos, restricciones de la base) se
// devuelven como texto para que el formulario pueda mostrarlos.
export async function ejecutar<T>(fn: () => Promise<T>): Promise<Resultado<T>> {
  try {
    return { ok: true, datos: await fn() };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, error: error.issues[0].message };
    }

    if (error instanceof NoAutorizadoError) {
      return { ok: false, error: error.message };
    }

    const codigo = (error as { code?: string }).code;
    if (codigo && MENSAJES_PRISMA[codigo]) {
      return { ok: false, error: MENSAJES_PRISMA[codigo] };
    }

    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Ocurrió un error inesperado" };
  }
}
