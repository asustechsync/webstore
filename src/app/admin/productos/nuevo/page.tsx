import { PageHeader } from "@/components/ui";
import { CrearProductoBase } from "./CrearProductoBase";

export default async function AdminNuevoProductoPage() {
  return (
    <>
      <PageHeader titulo="Nuevo producto" />
      <CrearProductoBase />
    </>
  );
}
