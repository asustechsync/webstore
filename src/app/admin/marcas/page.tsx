import { listarMarcasAdmin } from "@/features/catalogo/queries/marcas";
import { PageHeader } from "@/components/ui";
import { MarcasPanel } from "./MarcasPanel";

export default async function AdminMarcasPage() {
  const marcas = await listarMarcasAdmin();

  return (
    <>
      <PageHeader
        titulo="Marcas"
        descripcion="Al eliminar una marca, sus productos quedan sin marca (no se borran)."
      />

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
