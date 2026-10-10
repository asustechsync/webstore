import { IconoBuscar } from "../iconos";
import estilos from "./Buscador.module.css";

/** GET sin JavaScript: el buscador funciona aunque falle el cliente. */
export function Buscador() {
  return (
    <form role="search" action="/buscar" method="get" className={estilos.buscador}>
      <button type="submit" aria-label="Buscar" className={estilos.icono}>
        <IconoBuscar tamano={20} />
      </button>
      <input
        type="search"
        name="q"
        placeholder="Buscar productos"
        aria-label="Buscar productos"
        className={estilos.campo}
      />
    </form>
  );
}
