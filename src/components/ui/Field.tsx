import type { HTMLAttributes, ReactNode } from "react";
import styles from "@/styles/ui.module.css";

export function Field({
  etiqueta,
  error,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLLabelElement> & {
  etiqueta: ReactNode;
  error?: ReactNode;
}) {
  return (
    <label className={`${styles.campo} ${className ?? ""}`} {...props}>
      <span className={styles.etiqueta}>{etiqueta}</span>
      {children}
      {error && <span className={styles.textoError}>{error}</span>}
    </label>
  );
}
