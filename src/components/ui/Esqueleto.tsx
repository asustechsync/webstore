import styles from "./Esqueleto.module.css";

/**
 * Piezas de carga reutilizables.
 *
 * Se pintan mientras el servidor arma la página, dentro de los `loading.tsx`
 * de cada sección. La idea es que tengan la forma de lo que viene: si el
 * esqueleto ocupa el mismo alto y las mismas columnas que el contenido real,
 * al llegar los datos la página no da un salto.
 *
 * Un solo `role="status"` envuelve cada pantalla completa (ver `Cargando`);
 * los bloques sueltos son decorativos y se ocultan al lector de pantalla.
 */

/** Bloque gris con brillo. Es la unidad con la que se arma todo lo demás. */
export function Esqueleto({
  ancho,
  alto,
  className,
}: {
  ancho?: string;
  alto?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.bloque} ${className ?? ""}`}
      style={{ display: "block", width: ancho, height: alto }}
    />
  );
}

/**
 * Envoltura de una pantalla de carga completa.
 *
 * Anuncia una sola vez que se está cargando. Sin esto el lector de pantalla
 * no tiene nada que decir, porque los bloques van todos en aria-hidden.
 */
export function Cargando({
  children,
  etiqueta = "Cargando contenido",
}: {
  children: React.ReactNode;
  etiqueta?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={etiqueta}>
      {children}
    </div>
  );
}

/** Varias líneas de texto; la última sale más corta, como un párrafo real. */
export function EsqueletoTexto({ lineas = 3 }: { lineas?: number }) {
  return (
    <div className={styles.texto}>
      {Array.from({ length: lineas }, (_, indice) => (
        <Esqueleto key={indice} alto="0.75rem" className={styles.textoLinea} />
      ))}
    </div>
  );
}

/** Silueta de PageHeader: título y descripción. */
export function EsqueletoCabecera({ conDescripcion = true }: { conDescripcion?: boolean }) {
  return (
    <div className={styles.cabecera}>
      <Esqueleto ancho="min(14rem, 60%)" alto="2rem" />
      {conDescripcion && <Esqueleto ancho="min(24rem, 85%)" alto="1rem" />}
    </div>
  );
}

/**
 * Grilla de tarjetas de producto. Las columnas salen de `--catalogo-columnas`
 * igual que en ProductosGrid, así que en móvil son 2 y en escritorio 6 sin
 * repetir la regla acá.
 */
export function EsqueletoGrid({ tarjetas = 8 }: { tarjetas?: number }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: tarjetas }, (_, indice) => (
        <div key={indice} className={styles.tarjeta}>
          <Esqueleto className={styles.tarjetaImagen} />
          <div className={styles.tarjetaInfo}>
            <Esqueleto ancho="40%" alto="0.7rem" />
            <Esqueleto ancho="85%" alto="0.9rem" />
            <Esqueleto ancho="55%" alto="1rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Silueta de las tablas del panel, con su cabecera y sus filas. */
export function EsqueletoTabla({
  columnas = 5,
  filas = 6,
}: {
  columnas?: number;
  filas?: number;
}) {
  return (
    <div className={styles.tablaWrap}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            {Array.from({ length: columnas }, (_, indice) => (
              <th key={indice}>
                <Esqueleto ancho="70%" alto="0.7rem" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: filas }, (_, fila) => (
            <tr key={fila}>
              {Array.from({ length: columnas }, (_, columna) => (
                <td key={columna}>
                  {/* La primera columna suele llevar el nombre: va más ancha. */}
                  <Esqueleto ancho={columna === 0 ? "85%" : "55%"} alto="0.85rem" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Silueta de un formulario: etiqueta y control por campo. */
export function EsqueletoFormulario({ campos = 4 }: { campos?: number }) {
  return (
    <div className={styles.formulario}>
      {Array.from({ length: campos }, (_, indice) => (
        <div key={indice} className={styles.campo}>
          <Esqueleto ancho="8rem" alto="0.75rem" />
          <Esqueleto className={styles.control} />
        </div>
      ))}
    </div>
  );
}

/** Silueta de la ficha de producto: galería a un lado, panel de compra al otro. */
export function EsqueletoFicha() {
  return (
    <div className={styles.ficha}>
      <Esqueleto className={styles.fichaGaleria} />
      <div className={styles.fichaPanel}>
        <Esqueleto ancho="35%" alto="0.8rem" />
        <Esqueleto ancho="90%" alto="1.75rem" />
        <Esqueleto ancho="45%" alto="1.5rem" />
        <EsqueletoTexto lineas={3} />
        <Esqueleto alto="var(--control-alto)" />
      </div>
    </div>
  );
}
