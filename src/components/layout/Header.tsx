import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getUsuarioActual } from "@/lib/auth";
import styles from "./Header.module.css";

export async function Header() {
  const usuario = await getUsuarioActual();

  return (
    <header className={styles.header}>
      <Container>
        <nav className={styles.nav}>
          <Link href="/" className={styles.marca}>
            Webstore
          </Link>
          <div className={styles.enlaces}>
            <Link href="/productos">Productos</Link>
            <Link href="/categorias">Categorías</Link>
            <Link href="/carrito">Carrito</Link>
            <Link href="/cuenta">Mi cuenta</Link>
            {usuario?.rol.nombre === "ADMIN" && <Link href="/admin">Panel admin</Link>}
          </div>
        </nav>
      </Container>
    </header>
  );
}
