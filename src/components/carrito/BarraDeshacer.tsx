"use client";

import styles from "./carrito.module.css";

/** Barra breve que permite revertir la última acción destructiva. */
export function BarraDeshacer({
  mensaje,
  onDeshacer,
}: {
  mensaje: string;
  onDeshacer: () => void;
}) {
  return (
    <div className={styles.deshacer} role="status">
      <span className={styles.deshacerMensaje}>{mensaje}</span>
      <button type="button" className={styles.deshacerBoton} onClick={onDeshacer}>
        Deshacer
      </button>
    </div>
  );
}
