import type { ReactNode } from "react";
import { Buscador } from "./Buscador";
import { Contenedor } from "./Contenedor";
import { Logo } from "./Logo";
import estilos from "./Encabezado.module.css";

type Props = {
  /** Categorías principales. */
  enlaces?: { texto: string; href: string }[];
  /** Carrito y cuenta. La sesión entra aquí como isla cliente (el layout no lee cookies). */
  acciones?: ReactNode;
};

export function Encabezado({ enlaces = [], acciones }: Props) {
  return (
    <>
      <a href="#contenido" className={estilos.saltar}>
        Saltar al contenido
      </a>
      <header className={estilos.encabezado}>
        <Contenedor>
          <div className={estilos.fila}>
            <div className={estilos.zonaLogo}>
              <Logo />
            </div>
            <div className={estilos.zonaBuscador}>
              <Buscador />
            </div>
            <div className={estilos.acciones}>{acciones}</div>
            {enlaces.length > 0 && (
              <nav aria-label="Principal" className={estilos.menu}>
                <ul>
                  {enlaces.map((e) => (
                    <li key={e.href}>
                      <a href={e.href}>{e.texto}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </Contenedor>
      </header>
    </>
  );
}
