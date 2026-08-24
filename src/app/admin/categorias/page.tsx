import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { CategoriasPanel } from "./CategoriasPanel";

export default async function AdminCategoriasPage() {
  const categorias = await db.categoria.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true } } },
  });

  return (
    <>
      <PageHeader
        titulo="Categorías"
        descripcion="Organiza el catálogo. Una categoría con productos no se puede eliminar."
      />

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
