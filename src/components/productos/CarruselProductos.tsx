"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconoFlechaDerecha, IconoFlechaIzquierda } from "@/components/ui/ActionIcons";
import { ProductoCard, type ProductoCardData } from "./ProductoCard";
import styles from "./CarruselProductos.module.css";

/**
 * Grilla deslizable de productos.
 *
 * Se ve como la grilla normal del catálogo: entran las mismas tarjetas por
 * fila que define `--catalogo-visibles` en tokens.css (6 en escritorio) y el
 * resto se alcanza deslizando en horizontal, con flechas cuando hay puntero.
 */
export function CarruselProductos({
  productos,
  etiqueta,
  titulo,
  variante = "tarjeta",
}: {
  productos: ProductoCardData[];
  etiqueta?: "nuevo";
  /** Describe el carrusel para lectores de pantalla. */
  titulo: string;
  /** Se traslada a ProductoCard: la portada usa la lectura limpia. */
  variante?: "tarjeta" | "limpia";
}) {
  const pistaRef = useRef<HTMLUListElement>(null);
  const [puedeAnterior, setPuedeAnterior] = useState(false);
  const [puedeSiguiente, setPuedeSiguiente] = useState(false);

  const revisarLimites = useCallback(() => {
    const pista = pistaRef.current;
    if (!pista) return;
    const margen = 4; // tolerancia para el redondeo del scroll
    setPuedeAnterior(pista.scrollLeft > margen);
    setPuedeSiguiente(pista.scrollLeft + pista.clientWidth < pista.scrollWidth - margen);
  }, []);

  useEffect(() => {
    revisarLimites();
    window.addEventListener("resize", revisarLimites);
    return () => window.removeEventListener("resize", revisarLimites);
  }, [revisarLimites, productos.length]);

  const desplazar = (direccion: 1 | -1) => {
    const pista = pistaRef.current;
    if (!pista) return;
    // Avanza una tarjeta por clic para no saltarse productos.
    const tarjeta = pista.firstElementChild;
    const separacion = parseFloat(getComputedStyle(pista).columnGap) || 0;
    const paso = (tarjeta?.getBoundingClientRect().width ?? pista.clientWidth) + separacion;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    pista.scrollBy({ left: direccion * paso, behavior: reducido ? "auto" : "smooth" });
  };

  return (
    <div className={styles.carrusel}>
      <ul
        ref={pistaRef}
        className={styles.pista}
        onScroll={revisarLimites}
        aria-label={titulo}
        tabIndex={0}
      >
        {productos.map((producto, indice) => (
          <li key={producto.varianteId ?? producto.slug} className={styles.item}>
            <ProductoCard
              producto={producto}
              etiqueta={etiqueta}
              prioridad={indice < 2}
              variante={variante}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={`${styles.flecha} ${styles.flechaAnterior}`}
        onClick={() => desplazar(-1)}
        disabled={!puedeAnterior}
        aria-label="Ver productos anteriores"
      >
        <IconoFlechaIzquierda />
      </button>
      <button
        type="button"
        className={`${styles.flecha} ${styles.flechaSiguiente}`}
        onClick={() => desplazar(1)}
        disabled={!puedeSiguiente}
        aria-label="Ver más productos"
      >
        <IconoFlechaDerecha />
      </button>
    </div>
  );
}
