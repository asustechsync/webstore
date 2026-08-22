import styles from "./Button.module.css";

export function Button({
  variante = "primario",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "secundario" }) {
  return (
    <button
      className={`${styles.boton} ${styles[variante]} ${className ?? ""}`}
      {...props}
    />
  );
}
