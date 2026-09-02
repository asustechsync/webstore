import styles from "@/styles/ui.module.css";
import { LinkButton } from "./LinkButton";

/** Mensaje único para listados sin resultados (catálogo, categorías, carrito). */
export function EstadoVacio({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  accion?: { href: string; texto: string };
}) {
  return (
    <div className={styles.vacio}>
      <p className={styles.seccionTitulo}>{titulo}</p>
      {descripcion ? <p>{descripcion}</p> : null}
      {accion ? (
        <LinkButton href={accion.href} variante="secundario" anchoCompleto={false}>
          {accion.texto}
        </LinkButton>
      ) : null}
    </div>
  );
}
