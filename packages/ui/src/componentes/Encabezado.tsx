import type { ReactNode } from "react";
import { IconoCarrito, IconoUsuario } from "../iconos";
import { Buscador } from "./Buscador";
import { Contenedor } from "./Contenedor";
import { Logo } from "./Logo";
import estilos from "./Encabezado.module.css";

type Enlace = { texto: string; href: string; etiqueta?: "Nuevo" | "Oferta" };

type Props = {
  /** Categorías principales. */
  enlaces?: Enlace[];
  /** Carrito y cuenta. La sesión entra aquí como isla cliente (el layout no lee cookies). */
  acciones?: ReactNode;
};

// Datos de ejemplo: se reemplazan cuando las categorías salgan del catálogo cacheado.
const enlacesEjemplo: Enlace[] = [
  { texto: "Procesadores", href: "/categoria/procesadores" },
  { texto: "Tarjetas de video", href: "/categoria/tarjetas-de-video" },
  { texto: "Placas madre", href: "/categoria/placas-madre" },
  { texto: "Memorias RAM", href: "/categoria/memorias-ram" },
  { texto: "Almacenamiento", href: "/categoria/almacenamiento" },
  { texto: "PCs armadas", href: "/categoria/pcs-armadas", etiqueta: "Nuevo" },
  { texto: "Ofertas", href: "/ofertas", etiqueta: "Oferta" },
];

const enlacesAyuda = [
  { texto: "Ofertas de la semana", href: "/ofertas" },
  { texto: "Nuestras tiendas", href: "/tiendas" },
  { texto: "Nosotros", href: "/nosotros" },
  { texto: "Contacto", href: "/contacto" },
  { texto: "Ayuda", href: "/ayuda" },
];

export function Encabezado({ enlaces = enlacesEjemplo, acciones }: Props) {
  return (
    <>
      <a href="#contenido" className={estilos.saltar}>
        Saltar al contenido
      </a>
      <header className={estilos.encabezado}>
        {/* Bloque 1: aviso promocional */}
        <div className={estilos.aviso}>
          <Contenedor>
            <p>
              <strong>Envío gratis</strong> en Lima por compras desde S/ 199.{" "}
              <strong>10% de descuento</strong> con el código <strong>HARD10</strong>.{" "}
              <a href="/ofertas">Ver ofertas</a>
            </p>
          </Contenedor>
        </div>

        {/* Bloque 2: enlaces de ayuda y preferencias (solo escritorio) */}
        <div className={estilos.barraAyuda}>
          <Contenedor>
            <div className={estilos.filaAyuda}>
              <nav aria-label="Ayuda">
                <ul className={estilos.listaAyuda}>
                  {enlacesAyuda.map((e) => (
                    <li key={e.href}>
                      <a href={e.href}>{e.texto}</a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className={estilos.preferencias}>
                <span className={estilos.preferencia}>Español</span>
                <span className={estilos.preferencia}>PEN S/</span>
              </div>
            </div>
          </Contenedor>
        </div>

        {/* Bloque 3: logo, buscador y acciones */}
        <Contenedor>
          <div className={estilos.fila}>
            <div className={estilos.zonaLogo}>
              <Logo />
            </div>
            <div className={estilos.zonaBuscador}>
              <Buscador />
            </div>
            <div className={estilos.acciones}>
              {acciones ?? (
                <>
                  <a href="/mi-cuenta" className={estilos.ingresar}>
                    <IconoUsuario tamano={18} />
                    <span>Ingresar</span>
                  </a>
                  <a href="/carrito" className={estilos.carrito} aria-label="Carrito, 0 productos">
                    <span className={estilos.iconoCarrito}>
                      <IconoCarrito tamano={20} />
                      <span className={estilos.contador}>0</span>
                    </span>
                    <span className={estilos.total}>S/ 0.00</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </Contenedor>

        {/* Bloque 4: menú de categorías */}
        {enlaces.length > 0 && (
          <div className={estilos.barraMenu}>
            <Contenedor>
              <div className={estilos.filaMenu}>
                <button type="button" className={estilos.botonMenu} aria-label="Todas las categorías">
                  <span />
                  <span />
                  <span />
                </button>
                <nav aria-label="Principal" className={estilos.menu}>
                  <ul>
                    {enlaces.map((e) => (
                      <li key={e.href}>
                        <a href={e.href}>
                          {e.texto}
                          {e.etiqueta && (
                            <span
                              className={
                                e.etiqueta === "Oferta" ? estilos.etiquetaOferta : estilos.etiqueta
                              }
                            >
                              {e.etiqueta}
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </Contenedor>
          </div>
        )}
      </header>
    </>
  );
}
