import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { EnlaceAdmin } from "./EnlaceAdmin";
import { HeaderMenu } from "./HeaderMenu";
import styles from "./Header.module.css";

/**
 * Cabecera de la tienda y de la cuenta.
 *
 * El marco es igual para todo el mundo y entra en el armazón estático. Lo
 * único que depende de la sesión —el atajo al panel— va aislado dentro de un
 * `<Suspense>`: así leer las cookies no arrastra a toda la página al render
 * por petición, que es lo que antes dejaba dinámicas las 38 rutas.
 */
export function Header({ ocultarEnMovil = false }: { ocultarEnMovil?: boolean }) {
  return (
    <header className={`${styles.header} ${ocultarEnMovil ? styles.ocultarEnMovil : ""}`}>
      <Container>
        <nav className={styles.nav}>
          <Link href="/" className={styles.marca}>
            Webstore
          </Link>
          {/* Sin fallback: hasta que se resuelve la sesión no hay nada que
              mostrar, y para quien no es administrador nunca lo habrá. */}
          <HeaderMenu
            enlaceAdmin={
              <Suspense fallback={null}>
                <EnlaceAdmin />
              </Suspense>
            }
          />
        </nav>
      </Container>
    </header>
  );
}
