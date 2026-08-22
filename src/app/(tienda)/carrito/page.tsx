"use client";

import { useCartStore } from "@/store/cartStore";
import { formatearPrecio } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";

export default function CarritoPage() {
  const items = useCartStore((estado) => estado.items);

  if (items.length === 0) {
    return (
      <main>
        <Container>
          <h1>Carrito</h1>
          <p>Tu carrito está vacío.</p>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container>
        <h1>Carrito</h1>
        <ul className={styles.lista}>
          {items.map((item) => (
            <li key={item.productoId} className={styles.item}>
              <span>{item.nombre} x{item.cantidad}</span>
              <span>{formatearPrecio(item.precio * item.cantidad)}</span>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
