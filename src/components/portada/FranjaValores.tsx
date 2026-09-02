import styles from "./FranjaValores.module.css";

/**
 * Tres promesas de la tienda en una franja tipográfica, sin iconos ni color:
 * separa el bloque de bienvenida del catálogo dando estructura con líneas.
 */
const VALORES = [
  {
    titulo: "Envíos a todo el Perú",
    texto: "Coordinamos la entrega con Shalom hasta tu agencia o dirección.",
  },
  {
    titulo: "Pago seguro",
    texto: "Procesamos el cobro con Izipay; no guardamos datos de tu tarjeta.",
  },
  {
    titulo: "Stock por talla y color",
    texto: "Cada variante tiene su propio inventario, así compras lo que existe.",
  },
];

export function FranjaValores() {
  return (
    <section className={styles.franja} aria-label="Cómo compras en Webstore">
      {VALORES.map((valor, indice) => (
        <article key={valor.titulo} className={styles.valor}>
          <span className={styles.numero} aria-hidden="true">
            {String(indice + 1).padStart(2, "0")}
          </span>
          <h2 className={styles.titulo}>{valor.titulo}</h2>
          <p className={styles.texto}>{valor.texto}</p>
        </article>
      ))}
    </section>
  );
}
