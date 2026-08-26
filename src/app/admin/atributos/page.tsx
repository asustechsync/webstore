import { listarAtributosAdmin } from "@/features/catalogo/queries/atributos";
import { PageHeader } from "@/components/ui";
import { CatalogoCamposPanel } from "./CatalogoCamposPanel";

export default async function AdminAtributosPage() {
  const atributos = await listarAtributosAdmin();

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
