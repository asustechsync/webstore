import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getUsuarioActual } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import { NOMBRES_ESTADO_PEDIDO } from "@/features/pedidos/estado";
import { obtenerMetodoPago } from "@/features/pedidos/metodos-pago";
import styles from "@/app/cuenta/cuenta.module.css";

const PASOS = ["PAGADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO"];

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { id } = await params;
  const { nuevo } = await searchParams;
  const usuario = await getUsuarioActual();
  if (!usuario) redirect(`/ingresar?redirectTo=/pedido/${id}`);
  const pedido = await db.pedido.findFirst({
    where: { id, usuarioId: usuario.id },
    include: { items: { include: { variante: { include: { producto: { select: { nombre: true } }, valores: { include: { valor: { include: { opcion: true } } } } } } } } },
  });
  if (!pedido) notFound();
  const indiceActual = PASOS.indexOf(pedido.estado);
  // Los pedidos anteriores al checkout no guardaron subtotal: se reconstruye
  // sumando sus líneas.
  const subtotal = Number(pedido.subtotal) > 0
    ? Number(pedido.subtotal)
    : pedido.items.reduce((suma, item) => suma + Number(item.precioUnit) * item.cantidad, 0);
  const metodo = obtenerMetodoPago(pedido.metodoPago);
  const tieneEnvio = Boolean(pedido.envioDireccion);

  return (
    <main className={styles.pedidoPrincipal}>
      <Container>
        <Link href="/cuenta/pedidos" className={styles.volver}>← Volver a mis pedidos</Link>
        {nuevo === "1" && <section className={styles.confirmacion}><h2>¡Gracias por tu compra!</h2><p>Registramos tu pedido y queda pendiente de pago.{metodo ? ` ${metodo.instrucciones}` : ""}</p></section>}
        <header className={styles.pedidoCabecera}><div><h1>Pedido #{pedido.id.slice(0, 8).toUpperCase()}</h1><p>Realizado el {pedido.creadoEn.toLocaleDateString("es-PE", { dateStyle: "long" })}</p></div><span className={styles.estado}>{NOMBRES_ESTADO_PEDIDO[pedido.estado]}</span></header>
        {pedido.estado !== "CANCELADO" && <section className={styles.tarjeta}><h2>Seguimiento</h2><div className={styles.seguimiento}>{PASOS.map((paso, indice) => <div key={paso} className={indice <= indiceActual ? `${styles.paso} ${styles.pasoActivo}` : styles.paso}>{NOMBRES_ESTADO_PEDIDO[paso]}</div>)}</div></section>}
        <div className={styles.pedidoGrid}>
          <section className={styles.tarjeta}><div className={styles.seccionCabecera}><div><h2>Productos</h2><p className={styles.descripcion}>{pedido.items.length} artículo(s) en este pedido.</p></div></div>{pedido.items.map((item) => { const atributos = item.variante.valores.map(({ valor }) => `${valor.opcion.nombre}: ${valor.valor}`).join(" · "); return <article className={styles.itemPedido} key={item.id}><div><h3>{item.variante.producto.nombre}</h3><p>{atributos || item.variante.sku}</p><p>Cantidad: {item.cantidad}</p></div><strong>{formatearPrecio(Number(item.precioUnit) * item.cantidad)}</strong></article>; })}</section>
          <aside className={styles.tarjeta}><div className={styles.seccionCabecera}><div><h2>Resumen de pago</h2><p className={styles.descripcion}>Importes registrados al confirmar.</p></div></div><div className={styles.totales}><div className={styles.totalFila}><span>Subtotal</span><span>{formatearPrecio(subtotal)}</span></div>{Number(pedido.descuento) > 0 && <div className={styles.totalFila}><span>Descuento</span><span>− {formatearPrecio(Number(pedido.descuento))}</span></div>}<div className={`${styles.totalFila} ${styles.totalFinal}`}><span>Total</span><span>{formatearPrecio(Number(pedido.total))}</span></div></div></aside>
          <section className={styles.tarjeta}><div className={styles.seccionCabecera}><div><h2>Entrega y pago</h2><p className={styles.descripcion}>Datos registrados al confirmar.</p></div></div><dl className={styles.datosPedido}><div><dt>Método de pago</dt><dd>{metodo?.nombre ?? "Por definir"}</dd></div>{tieneEnvio && <><div><dt>Recibe</dt><dd>{pedido.envioDestinatario}{pedido.envioTelefono ? ` · ${pedido.envioTelefono}` : ""}</dd></div><div><dt>Dirección</dt><dd>{pedido.envioDireccion}{pedido.envioReferencia ? ` · ${pedido.envioReferencia}` : ""}</dd></div><div><dt>Distrito</dt><dd>{[pedido.envioDistrito, pedido.envioProvincia, pedido.envioDepartamento].filter(Boolean).join(", ")}</dd></div></>}</dl>{metodo && <p className={styles.descripcion}>{metodo.instrucciones}</p>}</section>
        </div>
      </Container>
    </main>
  );
}
