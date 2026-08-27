import { SeguridadForm } from "./SeguridadForm";
import styles from "../cuenta.module.css";

export default function SeguridadPage() {
  return <section className={styles.tarjeta}>
    <div className={styles.seccionCabecera}><div><h2 className={styles.titulo}>Seguridad</h2><p className={styles.descripcion}>Administra la contraseña de acceso a tu cuenta.</p></div></div>
    <div className={styles.nota}><strong>Acceso protegido</strong><p>Usa una contraseña única que no utilices en otras páginas.</p></div>
    <SeguridadForm />
  </section>;
}
