"use client";

import { Button } from "@/components/ui/Button";
import { IconoStockBajo } from "@/components/ui/ActionIcons";
import { contarAvisos, type LineaRevisada } from "@/features/carrito/revision";
import type { ItemCarrito } from "@/store/cartStore";
import styles from "./carrito.module.css";

/**
 * Resume en una sola tarjeta todo lo que cambió desde que se guardó el
 * carrito y lo arregla de un toque: quita lo que ya no se vende, recorta las
 * cantidades al stock y toma los precios de hoy.
 */
export function AvisoRevision({
  lineas,
  onActualizar,
}: {
  lineas: LineaRevisada<ItemCarrito>[];
  onActualizar: () => void;
}) {
  const cambios = contarAvisos(lineas);
  if (cambios === 0) return null;

  return (
    <div className={styles.revision} role="status">
      <IconoStockBajo className={styles.revisionIcono} />

      <div className={styles.revisionTexto}>
        <p className={styles.revisionTitulo}>
          {cambios === 1 ? "Hay 1 cambio en tu carrito" : `Hay ${cambios} cambios en tu carrito`}
        </p>
        <p className={styles.revisionDetalle}>
          Comparamos tu carrito con la tienda. Actualízalo para seguir con el stock y los
          precios de hoy.
        </p>
      </div>

      <Button variante="secundario" anchoCompleto={false} onClick={onActualizar}>
        Actualizar carrito
      </Button>
    </div>
  );
}
