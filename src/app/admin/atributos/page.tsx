import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { CatalogoCamposPanel } from "./CatalogoCamposPanel";

export default async function AdminAtributosPage() {
  const atributos = await db.atributoCatalogo.findMany({
    orderBy: { nombre: "asc" },
    include: { valores: { orderBy: { orden: "asc" } } },
  });

  return (
    <>
      <PageHeader
        titulo="Atributos"
        descripcion="Crea valores reutilizables para configurar variantes de productos."
      />
      <CatalogoCamposPanel
        atributos={atributos.map((atributo) => ({
          id: atributo.id,
          nombre: atributo.nombre,
          clave: atributo.clave,
          tipo: atributo.tipo === "COLOR" ? "COLOR" : "LISTA",
          activo: atributo.activo,
          valores: atributo.valores.map((valor) => valor.valor),
        }))}
      />
    </>
  );
}
