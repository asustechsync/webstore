"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./cuenta.module.css";

const GRUPOS = [
  { titulo: "Mi cuenta", enlaces: [
    { href: "/cuenta", etiqueta: "Resumen" },
    { href: "/cuenta/pedidos", etiqueta: "Mis pedidos" },
    { href: "/cuenta/direcciones", etiqueta: "Direcciones" },
  ] },
  { titulo: "Configuración", enlaces: [
    { href: "/cuenta/perfil", etiqueta: "Mi perfil" },
    { href: "/cuenta/seguridad", etiqueta: "Seguridad" },
  ] },
];

export function CuentaNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Navegación de mi cuenta">
      {GRUPOS.map((grupo) => <div className={styles.navGrupo} key={grupo.titulo}>
        <p className={styles.navGrupoTitulo}>{grupo.titulo}</p>
        <div className={styles.navGrupoEnlaces}>{grupo.enlaces.map((enlace) => {
          const activo = enlace.href === "/cuenta" ? pathname === enlace.href : pathname.startsWith(enlace.href);
          return <Link key={enlace.href} href={enlace.href} className={activo ? `${styles.navEnlace} ${styles.navEnlaceActivo}` : styles.navEnlace}>
            <span className={styles.navPunto} aria-hidden="true" />
            {enlace.etiqueta}
          </Link>;
        })}</div>
      </div>)}
    </nav>
  );
}
