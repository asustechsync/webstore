import Image from "next/image";
import Link from "next/link";
import styles from "./CategoriaCard.module.css";

export type CategoriaCardData = {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  imagenUrl: string | null;
  totalProductos?: number;
};

export function CategoriaCard({
  categoria,
  mostrarDescripcion = false,
  variante = "tarjeta",
}: {
  categoria: CategoriaCardData;
  /** La portada usa la versión compacta; el listado muestra la descripción. */
  mostrarDescripcion?: boolean;
  /**
   * "tarjeta" para el listado; "limpia" deja la imagen suelta con el nombre
   * debajo, que es como se lee la tira de categorías de la portada.
   */
  variante?: "tarjeta" | "limpia";
}) {
  const total = categoria.totalProductos;

  return (
    <Link
      href={`/categorias/${categoria.slug}`}
      className={`${styles.tarjeta} ${variante === "limpia" ? styles.limpia : ""}`}
    >
      <div className={styles.imagenContenedor}>
        {categoria.imagenUrl ? (
          <Image
            src={categoria.imagenUrl}
            alt=""
            fill
            sizes="(min-width: 80rem) 16vw, (min-width: 48rem) 25vw, 50vw"
            className={styles.imagen}
          />
        ) : (
          <span className={styles.inicial} aria-hidden="true">
            {categoria.nombre.charAt(0)}
          </span>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.nombre}>{categoria.nombre}</h3>
        {mostrarDescripcion && categoria.descripcion ? (
          <p className={styles.descripcion}>{categoria.descripcion}</p>
        ) : null}
        {total != null ? (
          <p className={styles.conteo}>
            {total} producto{total === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
