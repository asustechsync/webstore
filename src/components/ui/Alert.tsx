import type { HTMLAttributes } from "react";
import styles from "@/styles/ui.module.css";

export function Alert({
  variante = "error",
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { variante?: "error" | "exito" }) {
  const estilo = variante === "error" ? styles.mensajeError : styles.mensajeExito;
  return <p className={`${estilo} ${className ?? ""}`} role="status" {...props} />;
}
