import Link from "next/link";
import styles from "@/styles/ui.module.css";

/**
 * Bloque de contenido de la tienda: título, bajada opcional y un enlace
 * "ver todo". Centraliza el ritmo vertical entre secciones para que las
 * páginas solo aporten su contenido.
 */
export function Section({
  titulo,
  descripcion,
  enlace,
  enlaceTexto = "Ver todo",
  className,
  children,
}: {
  titulo: React.ReactNode;
  descripcion?: React.ReactNode;
  enlace?: string;
  enlaceTexto?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${styles.seccion} ${className ?? ""}`}>
      <header className={styles.seccionEncabezado}>
        <div>
          <h2 className={styles.seccionTitulo}>{titulo}</h2>
          {descripcion ? <p className={styles.seccionDescripcion}>{descripcion}</p> : null}
        </div>
        {enlace ? (
          <Link href={enlace} className={styles.seccionEnlace}>
            {enlaceTexto}
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  );
}
