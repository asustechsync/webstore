import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./Button.module.css";

/**
 * Enlace con la apariencia de Button. Evita duplicar las clases de botón en
 * cada página que necesita una llamada a la acción que navega.
 */
export function LinkButton({
  variante = "primario",
  tamano = "normal",
  anchoCompleto = true,
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variante?: "primario" | "secundario" | "peligro";
  tamano?: "normal" | "pequeno";
  anchoCompleto?: boolean;
}) {
  return (
    <Link
      className={`${styles.boton} ${styles[variante]} ${
        tamano === "pequeno" ? styles.pequeno : ""
      } ${anchoCompleto ? "" : styles.anchoAuto} ${className ?? ""}`}
      {...props}
    />
  );
}
