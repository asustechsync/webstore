"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./cuenta.module.css";

const ENLACES = [
  { href: "/cuenta", etiqueta: "Inicio" },
  { href: "/cuenta/perfil", etiqueta: "Perfil" },
  { href: "/cuenta/pedidos", etiqueta: "Pedidos" },
  { href: "/cuenta/direcciones", etiqueta: "Direcciones" },
  { href: "/cuenta/pagos", etiqueta: "Pagos" },
  { href: "/cuenta/favoritos", etiqueta: "Favoritos" },
  { href: "/cuenta/seguridad", etiqueta: "Seguridad" },
];

export function CuentaNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Navegación de mi cuenta">
      {ENLACES.map((enlace) => {
        const activo = enlace.href === "/cuenta" ? pathname === enlace.href : pathname.startsWith(enlace.href);
        return <Link key={enlace.href} href={enlace.href} className={activo ? `${styles.navEnlace} ${styles.navEnlaceActivo}` : styles.navEnlace}>
          {enlace.etiqueta}
        </Link>;
      })}
    </nav>
  );
}
