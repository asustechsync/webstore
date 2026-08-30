"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./cuenta.module.css";
import { CerrarSesionBoton } from "./CerrarSesionBoton";

const ENLACES = [
  { href: "/cuenta/perfil", etiqueta: "Mi perfil", icono: "perfil" },
  { href: "/cuenta/pedidos", etiqueta: "Mis pedidos", icono: "pedidos" },
  { href: "/cuenta/direcciones", etiqueta: "Direcciones", icono: "direcciones" },
  { href: "/cuenta/favoritos", etiqueta: "Favoritos", icono: "favoritos" },
  { href: "/cuenta/seguridad", etiqueta: "Seguridad", icono: "seguridad" },
  { href: "/cuenta/configuracion", etiqueta: "Configuración", icono: "configuracion" },
] as const;

function IconoNav({ tipo }: { tipo: string }) {
  return <span className={`${styles.navIcono} ${styles[`navIcono${tipo.charAt(0).toUpperCase()}${tipo.slice(1)}`]}`} aria-hidden="true" />;
}

export function CuentaNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Navegación de mi cuenta">
      {ENLACES.map((enlace) => {
        const activo = pathname.startsWith(enlace.href);
        return <Link key={enlace.href} href={enlace.href} className={activo ? `${styles.navEnlace} ${styles.navEnlaceActivo}` : styles.navEnlace}>
          <IconoNav tipo={enlace.icono} />
          <span><strong>{enlace.etiqueta}</strong></span>
          <span className={styles.navFlecha} aria-hidden="true" />
        </Link>;
      })}
      <CerrarSesionBoton className={styles.navCerrarSesion}>
        <IconoNav tipo="salir" />
        <span><strong>Cerrar sesión</strong></span>
        <span className={styles.navFlecha} aria-hidden="true" />
      </CerrarSesionBoton>
    </nav>
  );
}
