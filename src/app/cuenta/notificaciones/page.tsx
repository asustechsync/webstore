import styles from "../cuenta.module.css";

export default function NotificacionesPage() {
  return (
    <section className={styles.tarjeta} aria-labelledby="titulo-notificaciones">
      <h2 id="titulo-notificaciones" className={styles.titulo}>Notificaciones</h2>
      <p className={styles.descripcion}>Administra los avisos sobre tus pedidos, promociones y novedades.</p>
      <p className={styles.vacio}>La configuración de notificaciones estará disponible próximamente.</p>
    </section>
  );
}
