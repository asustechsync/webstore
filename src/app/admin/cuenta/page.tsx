import { getUsuarioActual } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { CambiarPasswordForm } from "./CambiarPasswordForm";
import styles from "../admin.module.css";

export default async function AdminCuentaPage() {
  const usuario = await getUsuarioActual();

  return (
    <>
      <PageHeader
        titulo="Mi cuenta"
        descripcion={
          <>
            {usuario?.email} · rol {usuario?.rol.nombre}
          </>
        }
      />

      <section className={styles.seccion}>
        <h2 className={styles.titulo}>Contraseña</h2>
        <p className={styles.subtitulo}>
          Si entraste con Google, Microsoft o Facebook, definir una contraseña acá te permite
          ingresar también con tu correo.
        </p>
        <CambiarPasswordForm />
      </section>
    </>
  );
}
