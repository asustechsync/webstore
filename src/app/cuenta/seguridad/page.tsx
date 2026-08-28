import { SeguridadTabs } from "./SeguridadForm";
import styles from "../cuenta.module.css";

export default function SeguridadPage() {
  return <section className={styles.tarjeta}>
    <div className={styles.seccionCabecera}><div><h2 className={styles.titulo}>Seguridad</h2><p className={styles.descripcion}>Gestiona la seguridad y el acceso a tu cuenta.</p></div></div>
    <SeguridadTabs />
  </section>;
}
