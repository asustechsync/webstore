import { listarCategoriasAdmin } from "@/features/catalogo/queries/categorias";
import { PageHeader } from "@/components/ui";
import { CategoriasPanel } from "./CategoriasPanel";

export default async function AdminCategoriasPage() {
  const categorias = await listarCategoriasAdmin();

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
          orden: categoria.orden,
          destacada: categoria.destacada,
          tituloSeo: categoria.tituloSeo,
          descripcionSeo: categoria.descripcionSeo,
          padreId: categoria.padreId,
          activo: categoria.activo,
          productos: categoria._count.productos,
        }))}
      />
    </>
  );
}
