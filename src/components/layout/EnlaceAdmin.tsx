import Link from "next/link";
import { getUsuarioActual } from "@/lib/auth";

/**
 * Atajo al panel, solo para administradores.
 *
 * Es la única parte de la cabecera que depende de quién mira, y por eso vive
 * en su propio componente: envuelto en `<Suspense>` desde el Header, es un
 * hueco dinámico dentro de un armazón estático. La tienda entera se sigue
 * sirviendo pre-construida y este enlace llega por streaming un instante
 * después.
 *
 * El rol se lee de la base, que es la fuente de verdad. Antes se leía del
 * claim `user_role` del token en el navegador, pero eso dependía de que el
 * hook de Supabase estuviera habilitado en el proyecto: si no lo estaba, el
 * enlace no aparecía nunca.
 */
export async function EnlaceAdmin() {
  const usuario = await getUsuarioActual();
  if (usuario?.rol.nombre !== "ADMIN") return null;

  // Sin clase propia: hereda el estilo del resto de enlaces del menú, igual
  // que antes de moverlo a su propio componente.
  return <Link href="/admin">Panel admin</Link>;
}
