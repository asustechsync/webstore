import Image from "next/image";
import styles from "./CabeceraCatalogo.module.css";

/**
 * Encabezado de un listado acotado del catálogo (una categoría, una marca):
 * imagen opcional, nombre, bajada y recuento. Lo comparten las dos rutas para
 * que el listado se lea igual venga de donde venga.
 */
export function CabeceraCatalogo({
  titulo,
  descripcion,
  conteo,
  imagenUrl,
  /** El logo de una marca se lee mejor completo que recortado. */
  ajusteImagen = "cover",
}: {
  titulo: string;
  descripcion?: string | null;
  conteo?: string;
  imagenUrl?: string | null;
  ajusteImagen?: "cover" | "contain";
}) {
  return (
    <header className={styles.cabecera}>
      {imagenUrl && (
        <Image
          src={imagenUrl}
          alt=""
          className={ajusteImagen === "contain" ? styles.imagenContenida : styles.imagen}
          width={224}
          height={224}
          sizes="(min-width: 40rem) 112px, 72px"
        />
      )}
      <div>
        <h1 className={styles.titulo}>{titulo}</h1>
        {descripcion && <p className={styles.descripcion}>{descripcion}</p>}
        {conteo && <span className={styles.conteo}>{conteo}</span>}
      </div>
    </header>
  );
}
