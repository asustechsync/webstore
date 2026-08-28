"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./cuenta.module.css";

export function CuentaShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const esInicio = usePathname() === "/cuenta";

  return (
    <div className={`${styles.distribucion} ${esInicio ? "" : styles.enSubpagina}`}>
      {sidebar}
      <div className={styles.contenido}>
        {!esInicio && <Link href="/cuenta" className={styles.volverCuentaMovil}>← Mi cuenta</Link>}
        {children}
      </div>
    </div>
  );
}
