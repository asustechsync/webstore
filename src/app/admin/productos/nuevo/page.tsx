import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { CrearProductoBase } from "./CrearProductoBase";

export default async function AdminNuevoProductoPage() {
  const categorias = await db.categoria.findMany({
    where: { activo: true },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    select: { id: true, nombre: true },
  });
  return (
    <>
      <PageHeader titulo="Nuevo producto" descripcion="Elige cómo se vende, reserva su código y luego completa la ficha." />
      <CrearProductoBase categorias={categorias} />
    </>
  );
}
