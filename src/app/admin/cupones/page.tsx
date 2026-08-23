import { db } from "@/lib/db";
import { CuponesPanel } from "./CuponesPanel";
import styles from "../admin.module.css";

export default async function AdminCuponesPage() {
  const cupones = await db.cupon.findMany({ orderBy: { creadoEn: "desc" } });

  return (
    <>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Cupones</h1>
          <p className={styles.subtitulo}>Códigos de descuento aplicables en el checkout.</p>
        </div>
      </div>

      <CuponesPanel
        cupones={cupones.map((cupon) => ({
          id: cupon.id,
          codigo: cupon.codigo,
          tipo: cupon.tipo,
          // Decimal no es serializable hacia un componente cliente.
          valor: cupon.valor.toString(),
          montoMinimo: cupon.montoMinimo?.toString() ?? "",
          usoMaximo: cupon.usoMaximo,
          usosActuales: cupon.usosActuales,
          fechaInicio: cupon.fechaInicio?.toISOString().slice(0, 10) ?? "",
          fechaFin: cupon.fechaFin?.toISOString().slice(0, 10) ?? "",
          activo: cupon.activo,
        }))}
      />
    </>
  );
}
