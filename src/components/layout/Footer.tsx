import { Container } from "@/components/ui/Container";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <p className={styles.texto}>© {new Date().getFullYear()} Webstore</p>
      </Container>
    </footer>
  );
}
