import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import { PedidosTabla } from "./PedidosTabla";
import styles from "../admin.module.css";

export default async function AdminPedidosPage() {
  const pedidos = await db.pedido.findMany({
    orderBy: { creadoEn: "desc" },
    include: { usuario: true, _count: { select: { items: true } } },
  });

  return (
    <>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Pedidos</h1>
          <p className={styles.subtitulo}>Cambia el estado de un pedido desde la lista.</p>
        </div>
      </div>

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
