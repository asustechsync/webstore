import styles from "./PasosCompra.module.css";

/**
 * Los tres momentos de una compra, con el actual marcado.
 *
 * Son las pantallas reales del flujo: el carrito, el checkout (donde se
 * eligen envío y pago juntos) y la confirmación del pedido. Se muestra arriba
 * de cada una para que se vea cuánto falta antes de empezar a llenar datos.
 */
const PASOS = ["Carrito", "Envío y pago", "Confirmación"] as const;

export function PasosCompra({ actual }: { actual: 1 | 2 | 3 }) {
  return (
    <ol className={styles.pasos}>
      {PASOS.map((nombre, indice) => {
        const numero = indice + 1;
        const estado = numero < actual ? styles.hecho : numero === actual ? styles.actual : styles.pendiente;

        return (
          <li
            key={nombre}
            className={styles.paso}
            aria-current={numero === actual ? "step" : undefined}
          >
            <span className={`${styles.marca} ${estado}`} aria-hidden="true">
              {numero}
            </span>
            <span className={styles.nombre}>{nombre}</span>
          </li>
        );
      })}
    </ol>
  );
}
