import { db } from "@/lib/db";
import { MarcasPanel } from "./MarcasPanel";
import styles from "../admin.module.css";

export default async function AdminMarcasPage() {
  const marcas = await db.marca.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true } } },
  });

  return (
    <>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Marcas</h1>
          <p className={styles.subtitulo}>
            Al eliminar una marca, sus productos quedan sin marca (no se borran).
          </p>
        </div>
      </div>

      <MarcasPanel
        marcas={marcas.map((marca) => ({
          id: marca.id,
          nombre: marca.nombre,
          slug: marca.slug,
          logoUrl: marca.logoUrl,
          activo: marca.activo,
          productos: marca._count.productos,
        }))}
      />
    </>
  );
}
