import { db } from "@/lib/db";
import { CategoriasPanel } from "./CategoriasPanel";
import styles from "../admin.module.css";

export default async function AdminCategoriasPage() {
  const categorias = await db.categoria.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true } } },
  });

  return (
    <>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Categorías</h1>
          <p className={styles.subtitulo}>
            Organiza el catálogo. Una categoría con productos no se puede eliminar.
          </p>
        </div>
      </div>

      <CategoriasPanel
        categorias={categorias.map((categoria) => ({
          id: categoria.id,
          nombre: categoria.nombre,
          slug: categoria.slug,
          descripcion: categoria.descripcion,
          imagenUrl: categoria.imagenUrl,
          padreId: categoria.padreId,
          activo: categoria.activo,
          productos: categoria._count.productos,
        }))}
      />
    </>
  );
}
