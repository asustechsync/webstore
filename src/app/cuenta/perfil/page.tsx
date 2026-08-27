import { getUsuarioActual } from "@/lib/auth";
import { db } from "@/lib/db";
import { PerfilForm } from "./PerfilForm";
import styles from "../cuenta.module.css";

export default async function CuentaPerfilPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) return null;
  const perfil = await db.usuario.findUnique({ where: { id: usuario.id }, select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true, email: true, telefono: true, codigoPais: true, fechaNacimiento: true, genero: true, tipoDocumento: true, documento: true, creadoEn: true } });

  return (
    <section className={styles.tarjeta}>
      <div className={styles.seccionCabecera}><div><h2 className={styles.titulo}>Mi perfil</h2><p className={styles.descripcion}>Estos son los datos asociados a tu cuenta.</p></div></div>
      <PerfilForm perfil={{ nombre: perfil?.nombre ?? "", apellidoPaterno: perfil?.apellidoPaterno ?? "", apellidoMaterno: perfil?.apellidoMaterno ?? "", telefono: perfil?.telefono ?? "", codigoPais: perfil?.codigoPais ?? "+51", fechaNacimiento: perfil?.fechaNacimiento?.toISOString().slice(0, 10) ?? "", genero: perfil?.genero ?? "", tipoDocumento: perfil?.tipoDocumento ?? "", documento: perfil?.documento ?? "", email: perfil?.email ?? usuario.email }} />
      <p className={styles.pieDato}>Miembro desde {perfil?.creadoEn.toLocaleDateString("es-PE", { dateStyle: "long" }) ?? "—"}</p>
    </section>
  );
}
