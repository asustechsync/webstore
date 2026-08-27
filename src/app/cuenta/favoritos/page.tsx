import styles from "../cuenta.module.css";

export default function FavoritosPage() {
  return (
    <section className={styles.tarjeta} aria-labelledby="titulo-favoritos">
      <h2 id="titulo-favoritos" className={styles.titulo}>Mis favoritos</h2>
      <p className={styles.descripcion}>Guarda aquí los productos que quieras revisar más adelante.</p>
      <p className={styles.vacio}>Todavía no tienes productos favoritos.</p>
    </section>
  );
}
