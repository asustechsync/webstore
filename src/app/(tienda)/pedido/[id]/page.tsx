import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getUsuarioActual } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import styles from "@/app/cuenta/cuenta.module.css";

const NOMBRES_ESTADO: Record<string, string> = { PENDIENTE: "Pendiente", PAGADO: "Pagado", EN_PREPARACION: "En preparación", ENVIADO: "Enviado", ENTREGADO: "Entregado", CANCELADO: "Cancelado" };
const PASOS = ["PAGADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO"];

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await getUsuarioActual();
  if (!usuario) redirect(`/ingresar?redirectTo=/pedido/${id}`);
  const pedido = await db.pedido.findFirst({
    where: { id, usuarioId: usuario.id },
    include: { items: { include: { variante: { include: { producto: { select: { nombre: true } }, valores: { include: { valor: { include: { opcion: true } } } } } } } } },
  });
  if (!pedido) notFound();
  const indiceActual = PASOS.indexOf(pedido.estado);
  const subtotal = pedido.items.reduce((suma, item) => suma + Number(item.precioUnit) * item.cantidad, 0);

  return (
    <main className={styles.pedidoPrincipal}>
      <Container>
        <Link href="/cuenta/pedidos" className={styles.volver}>← Volver a mis pedidos</Link>
        <header className={styles.pedidoCabecera}><div><h1>Pedido #{pedido.id.slice(0, 8).toUpperCase()}</h1><p>Realizado el {pedido.creadoEn.toLocaleDateString("es-PE", { dateStyle: "long" })}</p></div><span className={styles.estado}>{NOMBRES_ESTADO[pedido.estado]}</span></header>
        {pedido.estado !== "CANCELADO" && <section className={styles.tarjeta}><h2>Seguimiento</h2><div className={styles.seguimiento}>{PASOS.map((paso, indice) => <div key={paso} className={indice <= indiceActual ? `${styles.paso} ${styles.pasoActivo}` : styles.paso}>{NOMBRES_ESTADO[paso]}</div>)}</div></section>}
        <div className={styles.pedidoGrid}>
          <section className={styles.tarjeta}><div className={styles.seccionCabecera}><div><h2>Productos</h2><p className={styles.descripcion}>{pedido.items.length} artículo(s) en este pedido.</p></div></div>{pedido.items.map((item) => { const atributos = item.variante.valores.map(({ valor }) => `${valor.opcion.nombre}: ${valor.valor}`).join(" · "); return <article className={styles.itemPedido} key={item.id}><div><h3>{item.variante.producto.nombre}</h3><p>{atributos || item.variante.sku}</p><p>Cantidad: {item.cantidad}</p></div><strong>{formatearPrecio(Number(item.precioUnit) * item.cantidad)}</strong></article>; })}</section>
          <aside className={styles.tarjeta}><div className={styles.seccionCabecera}><div><h2>Resumen de pago</h2><p className={styles.descripcion}>Importes registrados al confirmar.</p></div></div><div className={styles.totales}><div className={styles.totalFila}><span>Subtotal</span><span>{formatearPrecio(subtotal)}</span></div>{Number(pedido.descuento) > 0 && <div className={styles.totalFila}><span>Descuento</span><span>− {formatearPrecio(Number(pedido.descuento))}</span></div>}<div className={`${styles.totalFila} ${styles.totalFinal}`}><span>Total</span><span>{formatearPrecio(Number(pedido.total))}</span></div></div></aside>
        </div>
      </Container>
    </main>
  );
}
