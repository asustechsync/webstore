import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/auth";
import { obtenerResumenCuenta } from "@/features/usuarios/queries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { CuentaNav } from "./CuentaNav";
import { CerrarSesionBoton } from "./CerrarSesionBoton";
import { formatearNombreUbicacion } from "@/lib/ubicaciones";
import styles from "./cuenta.module.css";

function IconoVerificado() {
  return <svg className={styles.iconoVerificado} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Cuenta verificada"><path d="M21.5599 10.7405L20.1999 9.16055C19.9399 8.86055 19.7299 8.30055 19.7299 7.90055V6.20055C19.7299 5.14055 18.8599 4.27055 17.7999 4.27055H16.0999C15.7099 4.27055 15.1399 4.06055 14.8399 3.80055L13.2599 2.44055C12.5699 1.85055 11.4399 1.85055 10.7399 2.44055L9.16988 3.81055C8.86988 4.06055 8.29988 4.27055 7.90988 4.27055H6.17988C5.11988 4.27055 4.24988 5.14055 4.24988 6.20055V7.91055C4.24988 8.30055 4.03988 8.86055 3.78988 9.16055L2.43988 10.7505C1.85988 11.4405 1.85988 12.5605 2.43988 13.2505L3.78988 14.8405C4.03988 15.1405 4.24988 15.7005 4.24988 16.0905V17.8005C4.24988 18.8605 5.11988 19.7305 6.17988 19.7305H7.90988C8.29988 19.7305 8.86988 19.9405 9.16988 20.2005L10.7499 21.5605C11.4399 22.1505 12.5699 22.1505 13.2699 21.5605L14.8499 20.2005C15.1499 19.9405 15.7099 19.7305 16.1099 19.7305H17.8099C18.8699 19.7305 19.7399 18.8605 19.7399 17.8005V16.1005C19.7399 15.7105 19.9499 15.1405 20.2099 14.8405L21.5699 13.2605C22.1499 12.5705 22.1499 11.4305 21.5599 10.7405ZM16.1599 10.1105L11.3299 14.9405C11.1899 15.0805 10.9999 15.1605 10.7999 15.1605C10.5999 15.1605 10.4099 15.0805 10.2699 14.9405L7.84988 12.5205C7.55988 12.2305 7.55988 11.7505 7.84988 11.4605C8.13988 11.1705 8.61988 11.1705 8.90988 11.4605L10.7999 13.3505L15.0999 9.05055C15.3899 8.76055 15.8699 8.76055 16.1599 9.05055C16.4499 9.34055 16.4499 9.82055 16.1599 10.1105Z" /></svg>;
}

const nivelesPremium = [
  { nombre: "Guest", detalle: "Sin cuenta", beneficio: "Muestras regulares", clase: "guest", minimo: 0 },
  { nombre: "Pearl", detalle: "Miembros registrados", beneficio: "Acceso anticipado y envío gratis", clase: "pearl", minimo: 1 },
  { nombre: "Silver", detalle: "2+ compras", beneficio: "Regalo de bienvenida y beneficios Pearl", clase: "silver", minimo: 2 },
  { nombre: "Gold", detalle: "3+ compras", beneficio: "Regalo de cumpleaños y beneficios Silver", clase: "gold", minimo: 3 },
  { nombre: "Platinum", detalle: "4+ compras", beneficio: "Regalos de temporada y beneficios Gold", clase: "platinum", minimo: 4 },
] as const;

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getUsuarioActual();

  if (!usuario) {
    redirect("/ingresar");
  }
  const cuenta = await obtenerResumenCuenta(usuario.id);
  const direccionPrincipal = cuenta?.direcciones[0];
  const ubicacion = direccionPrincipal ? `${formatearNombreUbicacion(direccionPrincipal.provincia)}, PE` : "Ubicación no registrada";
  const compras = cuenta?._count.pedidos ?? 0;
  const nivelActual = [...nivelesPremium].reverse().find((nivel) => compras >= nivel.minimo) ?? nivelesPremium[0];

  return (
    <>
      <Header />
      <main className={styles.principal}>
        <Container>
          <div className={styles.distribucion}>
            <aside className={styles.sidebar}>
              <div className={styles.usuarioCard}>
                <div className={styles.usuarioPortada} />
                <div className={styles.usuarioCardCuerpo}>
                  <span className={styles.avatar} aria-hidden="true">{usuario.nombre.trim().charAt(0).toUpperCase()}</span>
                  <div className={styles.usuarioNombreFila}>
                    <strong>{usuario.nombre}</strong>
                    <IconoVerificado />
                  </div>
                  <p className={styles.usuarioUbicacion}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true"><path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg><span>{ubicacion}</span></p>
                  <div className={styles.usuarioMetricas}>
                    <span className={styles.usuarioRol}>{usuario.rol.nombre === "ADMIN" ? "Admin" : usuario.rol.nombre === "CLIENTE" ? "Cliente" : usuario.rol.nombre}</span>
                    <span className={styles.usuarioActivo}><i aria-hidden="true" /> Activa</span>
                  </div>
                </div>
              </div>
              <section className={styles.nivelesPremium} aria-labelledby="niveles-premium-titulo">
                <div className={styles.nivelesPremiumCabecera}>
                  <div>
                    <p id="niveles-premium-titulo" className={styles.nivelesPremiumTitulo}>Niveles premium</p>
                    <p className={styles.nivelesPremiumSubtitulo}>Tu nivel actual: <strong>{nivelActual.nombre}</strong></p>
                  </div>
                  <span className={styles.nivelesPremiumMarca}>{compras} {compras === 1 ? "compra" : "compras"}</span>
                </div>
                <article className={`${styles.nivelPremium} ${styles[nivelActual.clase]} ${styles.nivelPremiumActivo}`}>
                  <div className={styles.nivelPremiumOrb} aria-hidden="true">✦</div>
                  <div className={styles.nivelPremiumContenido}>
                    <strong>{nivelActual.nombre}</strong>
                    <span>{nivelActual.detalle}</span>
                    <small>✓ {nivelActual.beneficio}</small>
                  </div>
                </article>
              </section>
              <CuentaNav />
              <div className={styles.sidebarSalir}><CerrarSesionBoton /></div>
            </aside>
            <div className={styles.contenido}>{children}</div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
