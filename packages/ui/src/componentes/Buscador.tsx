import { IconoBuscar } from "../iconos";
import estilos from "./Buscador.module.css";

/** GET sin JavaScript: el buscador funciona aunque falle el cliente. */
export function Buscador() {
  return (
    <form role="search" action="/buscar" method="get" className={estilos.buscador}>
      <input
        type="search"
        name="q"
        placeholder="Buscar en el catálogo"
        aria-label="Buscar en el catálogo"
        className={estilos.campo}
      />
      <button type="submit" aria-label="Buscar" className={estilos.boton}>
        <IconoBuscar tamano={20} />
      </button>
    </form>
  );
}
