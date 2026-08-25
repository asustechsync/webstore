"use client";

import type { SelectHTMLAttributes } from "react";
import { IconoFlecha } from "./ActionIcons";
import styles from "./SelectConFlecha.module.css";

export function SelectConFlecha({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <span className={styles.contenedor}>
    <select {...props} className={`${className ?? ""} ${styles.select}`}>{children}</select>
    <IconoFlecha className={styles.flecha} />
  </span>;
}
