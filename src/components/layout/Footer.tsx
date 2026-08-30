import { Container } from "@/components/ui/Container";
import styles from "./Footer.module.css";

export function Footer({ ocultarEnMovil = false }: { ocultarEnMovil?: boolean }) {
  return (
    <footer className={`${styles.footer} ${ocultarEnMovil ? styles.ocultarEnMovil : ""}`}>
      <Container>
        <p className={styles.texto}>© {new Date().getFullYear()} Webstore</p>
      </Container>
    </footer>
  );
}
