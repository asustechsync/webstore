import styles from "./PageHeader.module.css";

export function PageHeader({
  titulo,
  descripcion,
  children,
}: {
  titulo: React.ReactNode;
  descripcion?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.encabezado}>
      <div>
        <h1 className={styles.titulo}>{titulo}</h1>
        {descripcion && <p className={styles.subtitulo}>{descripcion}</p>}
      </div>
      {children && <div className={styles.acciones}>{children}</div>}
    </header>
  );
}
