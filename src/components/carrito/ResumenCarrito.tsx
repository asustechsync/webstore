"use client";

import { IconoFlechaDerecha } from "@/components/ui/ActionIcons";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { calcularDescuentoCupon, type CuponAplicado } from "@/features/cupones/calculo";
import { METODOS_PAGO } from "@/features/pedidos/metodos-pago";
import { formatearPrecio } from "@/lib/utils";
import type { ItemCarrito } from "@/store/cartStore";
import { FormularioCupon } from "./FormularioCupon";
import styles from "./carrito.module.css";

// "Tarjeta, Yape, Plin o transferencia": se arma con los medios que la tienda
// tiene configurados, así el carrito nunca promete uno que el checkout no
// ofrece.
const MEDIOS_DE_PAGO = new Intl.ListFormat("es", { type: "disjunction" }).format(
  METODOS_PAGO.map((metodo) => metodo.corto),
);

export function ResumenCarrito({
  items,
  subtotal,
  cupon,
  ahorroOfertas,
  bloqueado,
}: {
  /** Solo las líneas marcadas: son las que se van a pagar. */
  items: ItemCarrito[];
  subtotal: number;
  cupon: CuponAplicado | null;
  /** Diferencia entre el precio de lista y el de oferta de lo marcado. */
  ahorroOfertas: number;
  /** Hay avisos sin resolver: pagar ahora cobraría otro importe. */
  bloqueado: boolean;
}) {
  // El descuento se recalcula en cada render con la misma fórmula que usa el
  // servidor, así cambiar cantidades lo actualiza sin volver a pedir el cupón.
  const descuento = cupon ? calcularDescuentoCupon(cupon, subtotal) : 0;
  const total = Math.max(subtotal - descuento, 0);
  const ahorroTotal = Math.round((ahorroOfertas + descuento) * 100) / 100;
  const sinSeleccion = items.length === 0;

  return (
    <aside className={styles.resumen} aria-label="Resumen del pedido">
      <section className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Cupones</h2>
        <div className={styles.bloqueCaja}>
          <FormularioCupon subtotal={subtotal} />
        </div>
      </section>

      <section className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Envío</h2>
        <div className={`${styles.bloqueCaja} ${styles.envio}`}>
          <p className={styles.envioTitulo}>¿A dónde lo enviamos?</p>
          <p className={styles.envioDetalle}>
            Llegamos a todo el Perú con Shalom. La dirección y el costo del envío se
            confirman en el siguiente paso.
          </p>
        </div>
      </section>

      <section className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Detalle del precio</h2>
        <div className={styles.bloqueCaja}>
          <p className={styles.detalleCuenta}>
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </p>

          {items.map((item) => (
            <div key={item.varianteId} className={styles.detalleFila}>
              <span className={styles.detalleProducto}>
                {item.cantidad} × {item.nombre}
              </span>
              <span>{formatearPrecio(item.precio * item.cantidad)}</span>
            </div>
          ))}

          {ahorroOfertas > 0 ? (
            <div className={`${styles.detalleFila} ${styles.detalleDescuento}`}>
              <span>Ofertas del catálogo</span>
              <span>−{formatearPrecio(ahorroOfertas)}</span>
            </div>
          ) : null}

          {descuento > 0 ? (
            <div className={`${styles.detalleFila} ${styles.detalleDescuento}`}>
              <span>Cupón {cupon?.codigo}</span>
              <span>−{formatearPrecio(descuento)}</span>
            </div>
          ) : null}

          <div className={styles.detalleFila}>
            <span>Envío</span>
            <span>Se calcula al pagar</span>
          </div>

          <div className={styles.detalleTotal}>
            <span>Total</span>
            <span aria-live="polite">{formatearPrecio(total)}</span>
          </div>
        </div>
      </section>

      {ahorroTotal > 0 ? (
        <p className={styles.resumenAhorro}>Ahorras {formatearPrecio(ahorroTotal)} en este pedido</p>
      ) : null}

      {bloqueado || sinSeleccion ? (
        <>
          <Button type="button" disabled>
            Realizar pedido
          </Button>
          <p className={styles.resumenBloqueo} role="status">
            {sinSeleccion
              ? "Marca al menos un producto para continuar."
              : "Actualiza tu carrito para continuar con los precios y el stock de hoy."}
          </p>
        </>
      ) : (
        <LinkButton href="/checkout" className={styles.pagar}>
          Realizar pedido
          <IconoFlechaDerecha />
        </LinkButton>
      )}

      <LinkButton href="/productos" variante="secundario">
        Seguir comprando
      </LinkButton>

      <p className={styles.resumenPagos}>Pagas con {MEDIOS_DE_PAGO}</p>
    </aside>
  );
}
