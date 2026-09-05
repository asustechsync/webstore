import { cacheLife } from "next/cache";
import { Container } from "@/components/ui/Container";
import styles from "./Footer.module.css";

/**
 * Pie del sitio.
 *
 * El año del copyright se lee del reloj, y eso basta para que Next no pueda
 * prerenderizar ninguna página que lleve pie. Como el valor solo cambia una
 * vez al año, se cachea en vez de pasarlo a petición: así el pie entra en el
 * armazón estático y la tienda entera se sigue sirviendo pre-construida.
 */
export async function Footer({ ocultarEnMovil = false }: { ocultarEnMovil?: boolean }) {
  "use cache";
  cacheLife("days");

  return (
    <footer className={`${styles.footer} ${ocultarEnMovil ? styles.ocultarEnMovil : ""}`}>
      <Container>
        <p className={styles.texto}>© {new Date().getFullYear()} Webstore</p>
      </Container>
    </footer>
  );
}
