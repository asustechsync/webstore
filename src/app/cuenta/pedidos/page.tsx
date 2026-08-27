import Link from "next/link";
import { getUsuarioActual } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import styles from "../cuenta.module.css";

const NOMBRES_ESTADO: Record<string, string> = { PENDIENTE: "Pendiente", PAGADO: "Pagado", EN_PREPARACION: "En preparación", ENVIADO: "Enviado", ENTREGADO: "Entregado", CANCELADO: "Cancelado" };

export default async function CuentaPedidosPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) return null;
  const pedidos = await db.pedido.findMany({ where: { usuarioId: usuario.id }, orderBy: { creadoEn: "desc" }, select: { id: true, estado: true, total: true, creadoEn: true, _count: { select: { items: true } } } });

  return (
    <section className={styles.tarjeta}>
      <div className={styles.seccionCabecera}><div><h2 className={styles.titulo}>Mis pedidos</h2><p className={styles.descripcion}>Historial y estado de tus compras.</p></div></div>
      {pedidos.length ? <div className={styles.lista}>{pedidos.map((pedido) => <Link className={styles.filaPedido} href={`/pedido/${pedido.id}`} key={pedido.id}><div><strong>Pedido #{pedido.id.slice(0, 8).toUpperCase()} · {formatearPrecio(Number(pedido.total))}</strong><span>{pedido._count.items} artículo(s) · {pedido.creadoEn.toLocaleDateString("es-PE", { dateStyle: "medium" })}</span></div><span className={styles.estado}>{NOMBRES_ESTADO[pedido.estado]}</span></Link>)}</div> : <p className={styles.vacio}>Aún no realizaste compras.</p>}
    </section>
  );
}
