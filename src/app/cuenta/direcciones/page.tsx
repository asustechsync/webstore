import { getUsuarioActual } from "@/lib/auth";
import { db } from "@/lib/db";
import { DireccionesPanel } from "./DireccionesPanel";
import styles from "../cuenta.module.css";

export default async function CuentaDireccionesPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) return null;
  const direcciones = await db.direccion.findMany({ where: { usuarioId: usuario.id }, orderBy: [{ predeterminada: "desc" }, { creadoEn: "desc" }] });

  return (
    <section className={`${styles.tarjeta} ${styles.tarjetaDirecciones}`}>
      <DireccionesPanel direcciones={direcciones.map((direccion) => ({ ...direccion, codigoPostal: direccion.codigoPostal ?? "", referencia: direccion.referencia ?? "" }))} />
    </section>
  );
}
