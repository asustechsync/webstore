"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./cuenta.module.css";

export function CuentaShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  const esInicio = pathname === "/cuenta";
  const titulosSeccion: Record<string, string> = {
    perfil: "Mi perfil",
    pedidos: "Mis pedidos",
    direcciones: "Direcciones",
    favoritos: "Favoritos",
    seguridad: "Seguridad",
    configuracion: "Configuración",
    notificaciones: "Notificaciones",
  };
  const seccion = pathname.split("/")[2];
  const tituloSeccion = titulosSeccion[seccion] ?? "Mi cuenta";

  return (
    <div className={`${styles.distribucion} ${esInicio ? "" : styles.enSubpagina}`}>
      {sidebar}
      <div className={styles.contenido}>
        {!esInicio && (
          <div className={styles.cabeceraSubpaginaMovil}>
            <Link href="/cuenta" className={styles.volverCuentaMovil} aria-label="Volver a Mi cuenta">
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <span>{tituloSeccion}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
