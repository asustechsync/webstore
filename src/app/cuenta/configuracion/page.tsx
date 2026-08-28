import Link from "next/link";
import styles from "../cuenta.module.css";

export default function ConfiguracionPage() {
  return <section className={styles.tarjeta} aria-labelledby="titulo-configuracion">
    <h2 id="titulo-configuracion" className={styles.titulo}>Configuración</h2>
    <p className={styles.descripcion}>Ajusta las preferencias generales de tu cuenta.</p>
    <Link className={styles.enlaceTexto} href="/cuenta/notificaciones">Administrar notificaciones</Link>
  </section>;
}
