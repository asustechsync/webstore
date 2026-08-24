import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import { PageHeader } from "@/components/ui";
import { PedidosTabla } from "./PedidosTabla";

export default async function AdminPedidosPage() {
  const pedidos = await db.pedido.findMany({
    orderBy: { creadoEn: "desc" },
    include: { usuario: true, _count: { select: { items: true } } },
  });

  return (
    <>
      <PageHeader
        titulo="Pedidos"
        descripcion="Cambia el estado de un pedido desde la lista."
      />

      <PedidosTabla
        pedidos={pedidos.map((pedido) => ({
          id: pedido.id,
          cliente: pedido.usuario.email,
          // Decimal no es serializable hacia un componente cliente.
          total: formatearPrecio(pedido.total.toString()),
          estado: pedido.estado,
          items: pedido._count.items,
          creadoEn: pedido.creadoEn.toLocaleDateString("es-PE"),
        }))}
      />
    </>
  );
}
