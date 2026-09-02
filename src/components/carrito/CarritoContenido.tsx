"use client";

import { useState } from "react";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { calcularSubtotal, contarUnidades, useCartStore } from "@/store/cartStore";
import { CarritoItem } from "./CarritoItem";
import { ResumenCarrito } from "./ResumenCarrito";
import { useCarritoHidratado } from "./useCarritoHidratado";
import styles from "./carrito.module.css";

export function CarritoContenido() {
  const items = useCartStore((estado) => estado.items);
  const cupon = useCartStore((estado) => estado.cupon);
  const vaciar = useCartStore((estado) => estado.vaciar);
  const hidratado = useCarritoHidratado();
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false);

  if (!hidratado) {
    return <p className={styles.cargando}>Cargando tu carrito…</p>;
  }

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agrega productos desde el catálogo y vuelve para completar tu pedido."
        accion={{ href: "/productos", texto: "Ver productos" }}
      />
    );
  }

  const unidades = contarUnidades(items);
  const subtotal = calcularSubtotal(items);

  return (
    <div className={styles.disposicion}>
      <div>
        <ul className={styles.lista}>
          {items.map((item) => (
            <CarritoItem key={item.varianteId} item={item} />
          ))}
        </ul>

        <div className={styles.piePista}>
          <button
            type="button"
            className={styles.vaciar}
            onClick={() => {
              if (!confirmandoVaciar) {
                setConfirmandoVaciar(true);
                return;
              }
              vaciar();
              setConfirmandoVaciar(false);
            }}
            onBlur={() => setConfirmandoVaciar(false)}
          >
            {confirmandoVaciar ? "Confirmar: vaciar carrito" : "Vaciar carrito"}
          </button>
        </div>
      </div>

      <ResumenCarrito subtotal={subtotal} unidades={unidades} cupon={cupon} />
    </div>
  );
}
