import styles from "./Button.module.css";

export function Button({
  variante = "primario",
  tamano = "normal",
  anchoCompleto = true,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "secundario" | "peligro";
  tamano?: "normal" | "pequeno";
  anchoCompleto?: boolean;
}) {
  return (
    <button
      className={`${styles.boton} ${styles[variante]} ${
        tamano === "pequeno" ? styles.pequeno : ""
      } ${anchoCompleto ? "" : styles.anchoAuto} ${className ?? ""}`}
      {...props}
    />
  );
}
