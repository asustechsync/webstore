"use client";

import { useState } from "react";
import { ProductoCard, type ProductoCardData } from "./ProductoCard";
import gridStyles from "./ProductosGrid.module.css";
import styles from "./ProductosDestacados.module.css";

const PRODUCTOS_POR_VISTA = 6;

export function ProductosDestacados({ productos }: { productos: ProductoCardData[] }) {
  const [pagina, setPagina] = useState(0);

  const totalPaginas = Math.ceil(productos.length / PRODUCTOS_POR_VISTA);
  const visibles = productos.slice(
    pagina * PRODUCTOS_POR_VISTA,
    (pagina + 1) * PRODUCTOS_POR_VISTA,
  );

  return (
    <div>
      <div className={gridStyles.grid}>
        {visibles.map((producto) => (
          <ProductoCard key={producto.varianteId ?? producto.slug} producto={producto} />
        ))}
      </div>

      {totalPaginas > 1 ? (
        <nav className={styles.navegacion} aria-label="Navegación de productos destacados">
          <button type="button" className={styles.botonVerMas} disabled={pagina === 0} onClick={() => setPagina((actual) => actual - 1)}>
            Anterior
          </button>
          <span className={styles.indicadorPagina}>Página {pagina + 1} de {totalPaginas}</span>
          <button type="button" className={styles.botonVerMas} disabled={pagina === totalPaginas - 1} onClick={() => setPagina((actual) => actual + 1)}>
            Siguiente
          </button>
        </nav>
      ) : null}
    </div>
  );
}
