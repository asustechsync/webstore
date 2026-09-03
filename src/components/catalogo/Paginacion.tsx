import Link from "next/link";
import { IconoFlechaDerecha, IconoFlechaIzquierda } from "@/components/ui/ActionIcons";
import { PARAMETROS, type ParametrosBusqueda } from "@/features/catalogo/filtros";
import styles from "./Paginacion.module.css";

/**
 * Paginación del catálogo. Conserva los filtros de la URL y solo reemplaza el
 * número de página, así avanzar no deshace la selección del usuario.
 */
export function Paginacion({
  basePath,
  parametros,
  pagina,
  totalPaginas,
}: {
  basePath: string;
  parametros: ParametrosBusqueda;
  pagina: number;
  totalPaginas: number;
}) {
  if (totalPaginas <= 1) return null;

  function enlace(destino: number) {
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(parametros)) {
      if (clave === PARAMETROS.pagina || valor == null) continue;
      for (const item of Array.isArray(valor) ? valor : [valor]) params.append(clave, item);
    }
    if (destino > 1) params.set(PARAMETROS.pagina, String(destino));
    const consulta = params.toString();
    return consulta ? `${basePath}?${consulta}` : basePath;
  }

  const anterior = pagina > 1 ? enlace(pagina - 1) : null;
  const siguiente = pagina < totalPaginas ? enlace(pagina + 1) : null;

  return (
    <nav className={styles.paginacion} aria-label="Paginación del catálogo">
      {anterior ? (
        <Link href={anterior} className={styles.boton} rel="prev">
          <IconoFlechaIzquierda />
          Anterior
        </Link>
      ) : (
        <span className={`${styles.boton} ${styles.inactivo}`} aria-hidden>
          <IconoFlechaIzquierda />
          Anterior
        </span>
      )}

      <span className={styles.posicion} aria-current="page">
        Página {pagina} de {totalPaginas}
      </span>

      {siguiente ? (
        <Link href={siguiente} className={styles.boton} rel="next">
          Siguiente
          <IconoFlechaDerecha />
        </Link>
      ) : (
        <span className={`${styles.boton} ${styles.inactivo}`} aria-hidden>
          Siguiente
          <IconoFlechaDerecha />
        </span>
      )}
    </nav>
  );
}
