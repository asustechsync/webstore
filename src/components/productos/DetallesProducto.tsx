import styles from "./DetallesProducto.module.css";

export type BloqueDetalle = { titulo: string; contenido: string };

/**
 * Fichas del producto en acordeón nativo (`<details>`): sin JavaScript, se
 * puede imprimir y buscar en la página, y la primera queda abierta.
 */
export function DetallesProducto({ bloques }: { bloques: BloqueDetalle[] }) {
  if (bloques.length === 0) return null;

  return (
    <section className={styles.detalles} aria-label="Detalles del producto">
      {bloques.map((bloque, indice) => (
        <details key={bloque.titulo} className={styles.bloque} open={indice === 0}>
          <summary className={styles.titulo}>{bloque.titulo}</summary>
          <div className={styles.contenido}>
            {bloque.contenido.split(/\n+/).map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
          </div>
        </details>
      ))}
    </section>
  );
}
