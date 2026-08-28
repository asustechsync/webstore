import Link from "next/link";
import { getUsuarioActual } from "@/lib/auth";
import { NOMBRES_ESTADO_PEDIDO } from "@/features/pedidos/estado";
import { calcularPorcentajePerfil, obtenerPedidosRecientes, obtenerResumenCuenta } from "@/features/usuarios/queries";
import styles from "./cuenta.module.css";

export default async function CuentaPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) return null;
  const [cuenta, pedidos] = await Promise.all([
    obtenerResumenCuenta(usuario.id),
    obtenerPedidosRecientes(usuario.id),
  ]);
  const porcentajePerfil = calcularPorcentajePerfil({
    nombre: usuario.nombre,
    email: usuario.email,
    apellidoPaterno: cuenta?.apellidoPaterno ?? null,
    apellidoMaterno: cuenta?.apellidoMaterno ?? null,
    telefono: cuenta?.telefono ?? null,
    fechaNacimiento: cuenta?.fechaNacimiento ?? null,
    genero: cuenta?.genero ?? null,
    tipoDocumento: cuenta?.tipoDocumento ?? null,
    documento: cuenta?.documento ?? null,
  });

  return (
    <>
      <header className={styles.seccionCabecera}>
        <div><h2 className={styles.titulo}>Hola, {usuario.nombre}</h2><p className={styles.descripcion}>Aquí tienes un resumen de tu cuenta.</p></div>
      </header>
      <section className={`${styles.resumenes} ${styles.resumenPrincipal}`} aria-label="Resumen de cuenta">
        <div className={styles.resumenNumero}><strong>{cuenta?._count.pedidos ?? 0}</strong><span>Pedidos realizados</span></div>
        <div className={styles.resumenNumero}><strong>{cuenta?._count.direcciones ?? 0}</strong><span>Direcciones guardadas</span></div>
        <div className={styles.resumenNumero}><strong>{usuario.rol.nombre === "CLIENTE" ? "Cliente" : usuario.rol.nombre}</strong><span>Tipo de cuenta</span></div>
      </section>
      <section className={styles.tarjeta}>
        <div className={styles.seccionCabecera}><div><h2>Pedidos recientes</h2><p className={styles.descripcion}>Consulta el estado de tus compras.</p></div><Link className={styles.enlaceTexto} href="/cuenta/pedidos">Ver todos</Link></div>
        {pedidos.length ? <div className={styles.lista}>{pedidos.map((pedido) => <Link className={styles.filaPedido} href={`/pedido/${pedido.id}`} key={pedido.id}><div><strong>Pedido #{pedido.id.slice(0, 8).toUpperCase()}</strong><span>{pedido.creadoEn.toLocaleDateString("es-PE", { dateStyle: "medium" })}</span></div><span className={styles.estado}>{NOMBRES_ESTADO_PEDIDO[pedido.estado]}</span></Link>)}</div> : <p className={styles.vacio}>Aún no tienes pedidos. Cuando compres, podrás seguirlos aquí.</p>}
      </section>
      <section className={styles.accesos} aria-label="Accesos rápidos">
        <Link href="/cuenta/pedidos" className={styles.acceso}><h2>Mis pedidos</h2><p>Revisa compras y su estado de entrega.</p></Link>
        <Link href="/cuenta/direcciones" className={styles.acceso}><h2>Direcciones</h2><p>Consulta tus direcciones de entrega.</p></Link>
        <Link href="/cuenta/perfil" className={styles.acceso}><h2>Mi perfil</h2><p>Consulta tus datos de contacto.</p></Link>
      </section>
      <section className={styles.dobleColumna}>
        <div className={styles.tarjetaCompacta}><div className={styles.seccionCabecera}><div><h2>Completa tu perfil</h2><p className={styles.descripcion}>Facilita la coordinación de tus entregas.</p></div><strong>{porcentajePerfil}%</strong></div><div className={styles.progreso} aria-label={`Perfil completado al ${porcentajePerfil}%`}><span style={{ width: `${porcentajePerfil}%` }} /></div><Link href="/cuenta/perfil" className={styles.enlaceTexto}>Revisar mis datos</Link></div>
        <div className={styles.tarjetaCompacta}><h2>¿Necesitas ayuda?</h2><p className={styles.descripcion}>Consulta el estado de un pedido o comunícate con la tienda indicando tu número de compra.</p><Link href="/cuenta/pedidos" className={styles.enlaceTexto}>Ir a mis pedidos</Link></div>
      </section>
    </>
  );
}
