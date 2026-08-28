import styles from "../cuenta.module.css";

export default function PagosPage() {
  return <section className={styles.tarjeta} aria-labelledby="titulo-pagos">
    <h2 id="titulo-pagos" className={styles.titulo}>Pagos</h2>
    <p className={styles.descripcion}>Consulta tus pagos, comprobantes y reembolsos.</p>
    <p className={styles.vacio}>Aún no hay pagos registrados.</p>
  </section>;
}
