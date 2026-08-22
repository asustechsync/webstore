import styles from "./Input.module.css";

export function Input({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className={styles.grupo}>
      <span className={styles.etiqueta}>{label}</span>
      <input className={styles.input} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
