"use client";

import { LinkButton } from "@/components/ui/LinkButton";
import { calcularDescuentoCupon, type CuponAplicado } from "@/features/cupones/calculo";
import { formatearPrecio } from "@/lib/utils";
import { FormularioCupon } from "./FormularioCupon";
import styles from "./carrito.module.css";

export function ResumenCarrito({
  subtotal,
  unidades,
  cupon,
}: {
  subtotal: number;
  unidades: number;
  cupon: CuponAplicado | null;
}) {
  // El descuento se recalcula en cada render con la misma fórmula que usa el
  // servidor, así cambiar cantidades lo actualiza sin volver a pedir el cupón.
  const descuento = cupon ? calcularDescuentoCupon(cupon, subtotal) : 0;
  const total = Math.max(subtotal - descuento, 0);

  return (
    <aside className={styles.resumen} aria-label="Resumen del pedido">
      <h2 className={styles.resumenTitulo}>Resumen</h2>

      <div className={styles.resumenFila}>
        <span>
          Productos ({unidades} {unidades === 1 ? "unidad" : "unidades"})
        </span>
        <span>{formatearPrecio(subtotal)}</span>
      </div>

      {descuento > 0 ? (
        <div className={`${styles.resumenFila} ${styles.resumenDescuento}`}>
          <span>Cupón {cupon?.codigo}</span>
          <span>−{formatearPrecio(descuento)}</span>
        </div>
      ) : null}

      <div className={styles.resumenFila}>
        <span>Envío</span>
        <span className={styles.resumenNota}>Se calcula al pagar</span>
      </div>

      <div className={styles.resumenTotal}>
        <span>Total</span>
        <span>{formatearPrecio(total)}</span>
      </div>

      <FormularioCupon subtotal={subtotal} />

      <LinkButton href="/checkout">Ir a pagar</LinkButton>
      <LinkButton href="/productos" variante="secundario">
        Seguir comprando
      </LinkButton>
    </aside>
  );
}
