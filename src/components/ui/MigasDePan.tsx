import Link from "next/link";
import styles from "./MigasDePan.module.css";

export type Miga = { texto: string; href?: string };

/** Ruta de navegación. El último elemento es la página actual y no enlaza. */
export function MigasDePan({ migas }: { migas: Miga[] }) {
  return (
    <nav aria-label="Ruta de navegación" className={styles.migas}>
      <ol className={styles.lista}>
        {migas.map((miga, indice) => {
          const ultima = indice === migas.length - 1;
          return (
            <li key={`${miga.texto}-${indice}`} className={styles.miga}>
              {miga.href && !ultima ? (
                <Link href={miga.href} className={styles.enlace}>
                  {miga.texto}
                </Link>
              ) : (
                <span aria-current={ultima ? "page" : undefined}>{miga.texto}</span>
              )}
              {ultima ? null : (
                <span className={styles.separador} aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
