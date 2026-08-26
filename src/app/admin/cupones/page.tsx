import { listarCuponesAdmin } from "@/features/cupones/queries";
import { PageHeader } from "@/components/ui";
import { CuponesPanel } from "./CuponesPanel";

export default async function AdminCuponesPage() {
  const cupones = await listarCuponesAdmin();

  return (
    <>
      <PageHeader
        titulo="Cupones"
        descripcion="Códigos de descuento aplicables en el checkout."
      />

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
