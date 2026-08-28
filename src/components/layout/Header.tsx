import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getUsuarioActual } from "@/lib/auth";
import { HeaderMenu } from "./HeaderMenu";
import styles from "./Header.module.css";

export async function Header({ ocultarEnMovil = false }: { ocultarEnMovil?: boolean }) {
  const usuario = await getUsuarioActual();

  return (
    <header className={`${styles.header} ${ocultarEnMovil ? styles.ocultarEnMovil : ""}`}>
      <Container>
        <nav className={styles.nav}>
          <Link href="/" className={styles.marca}>
            Webstore
          </Link>
          <HeaderMenu esAdmin={usuario?.rol.nombre === "ADMIN"} />
        </nav>
      </Container>
    </header>
  );
}
