import { LinkButton } from "@/components/ui/LinkButton";
import styles from "./CintaCierre.module.css";

/** Cierre de la portada: una sola llamada a la acción, sin adornos. */
export function CintaCierre() {
  return (
    <section className={styles.cinta}>
      <div>
        <p className={styles.etiqueta}>¿Listo para comprar?</p>
        <p className={styles.titulo}>Todo el catálogo, en un solo lugar.</p>
      </div>
      <div className={styles.acciones}>
        <LinkButton href="/productos" anchoCompleto={false}>
          Ver catálogo
        </LinkButton>
        <LinkButton href="/cuenta" variante="secundario" anchoCompleto={false}>
          Mi cuenta
        </LinkButton>
      </div>
    </section>
  );
}
