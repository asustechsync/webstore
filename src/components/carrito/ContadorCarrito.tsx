"use client";

import Link from "next/link";
import { contarUnidades, useCartStore } from "@/store/cartStore";
import { useCarritoHidratado } from "./useCarritoHidratado";
import styles from "./carrito.module.css";

/** Enlace al carrito con la cantidad de unidades guardadas. */
export function ContadorCarrito({ className }: { className?: string }) {
  const items = useCartStore((estado) => estado.items);
  const hidratado = useCarritoHidratado();
  const unidades = hidratado ? contarUnidades(items) : 0;

  return (
    <Link
      href="/carrito"
      className={`${styles.contador} ${className ?? ""}`}
      aria-label={unidades > 0 ? `Carrito, ${unidades} unidades` : "Carrito"}
    >
      Carrito
      {unidades > 0 ? (
        <span className={styles.burbuja} aria-hidden="true">
          {unidades > 99 ? "99+" : unidades}
        </span>
      ) : null}
    </Link>
  );
}
