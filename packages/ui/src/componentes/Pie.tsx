import { Contenedor } from "./Contenedor";
import estilos from "./Pie.module.css";

type Props = {
  grupos: { titulo: string; enlaces: { texto: string; href: string }[] }[];
  copyright: string;
};

export function Pie({ grupos, copyright }: Props) {
  return (
    <footer className={estilos.pie}>
      <Contenedor>
        <div className={estilos.grupos}>
          {grupos.map((g) => (
            <nav key={g.titulo} aria-label={g.titulo} className={estilos.grupo}>
              <h2 className={estilos.titulo}>{g.titulo}</h2>
              <ul>
                {g.enlaces.map((e) => (
                  <li key={e.href}>
                    <a href={e.href}>{e.texto}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className={estilos.copyright}>{copyright}</p>
      </Contenedor>
    </footer>
  );
}
