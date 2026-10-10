import { useId, type ReactNode } from "react";
import { Contenedor } from "./Contenedor";
import estilos from "./Seccion.module.css";

type Props = {
  titulo: string;
  /** Enlace "Ver todo" opcional, útil para enlazar a la categoría o marca. */
  verTodo?: { texto: string; href: string };
  children: ReactNode;
};

/** <section> con su <h2>, enlazados por aria-labelledby. */
export function Seccion({ titulo, verTodo, children }: Props) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={estilos.seccion}>
      <Contenedor>
        <div className={estilos.cabecera}>
          <h2 id={id} className={estilos.titulo}>
            {titulo}
          </h2>
          {verTodo && (
            <a href={verTodo.href} className={estilos.verTodo}>
              {verTodo.texto}
            </a>
          )}
        </div>
        {children}
      </Contenedor>
    </section>
  );
}
