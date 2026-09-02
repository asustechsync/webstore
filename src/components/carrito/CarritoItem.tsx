"use client";

import Image from "next/image";
import Link from "next/link";
import { IconoAgregar, IconoEliminar, IconoQuitar } from "@/components/ui/ActionIcons";
import { CANTIDAD_MAXIMA, useCartStore, type ItemCarrito } from "@/store/cartStore";
import { formatearPrecio } from "@/lib/utils";
import styles from "./carrito.module.css";

export function CarritoItem({ item }: { item: ItemCarrito }) {
  const actualizarCantidad = useCartStore((estado) => estado.actualizarCantidad);
  const quitarItem = useCartStore((estado) => estado.quitarItem);

  const opciones = [item.talla, item.color].filter(Boolean).join(" / ");
  const enlace = `/productos/${item.slug}?variante=${item.varianteId}`;

  return (
    <li className={styles.item}>
      <Link href={enlace} className={styles.itemImagen} aria-hidden="true" tabIndex={-1}>
        {item.imagenUrl ? (
          <Image src={item.imagenUrl} alt="" fill sizes="96px" className={styles.imagen} />
        ) : null}
      </Link>

      <div className={styles.itemDetalle}>
        <div className={styles.itemCabecera}>
          <div className={styles.itemTextos}>
            <Link href={enlace} className={styles.itemNombre}>
              {item.nombre}
            </Link>
            {opciones ? <p className={styles.itemOpciones}>{opciones}</p> : null}
            <p className={styles.itemUnitario}>{formatearPrecio(item.precio)} c/u</p>
          </div>
          <button
            type="button"
            className={styles.itemQuitar}
            onClick={() => quitarItem(item.varianteId)}
            aria-label={`Quitar ${item.nombre} del carrito`}
          >
            <IconoEliminar />
          </button>
        </div>

        <div className={styles.itemAcciones}>
          <div className={styles.cantidad}>
            <button
              type="button"
              className={styles.cantidadBoton}
              onClick={() => actualizarCantidad(item.varianteId, item.cantidad - 1)}
              disabled={item.cantidad <= 1}
              aria-label="Quitar una unidad"
            >
              <IconoQuitar />
            </button>
            <span className={styles.cantidadValor} aria-live="polite">
              {item.cantidad}
            </span>
            <button
              type="button"
              className={styles.cantidadBoton}
              onClick={() => actualizarCantidad(item.varianteId, item.cantidad + 1)}
              disabled={item.cantidad >= CANTIDAD_MAXIMA}
              aria-label="Agregar una unidad"
            >
              <IconoAgregar />
            </button>
          </div>

          <span className={styles.itemTotal}>
            {formatearPrecio(item.precio * item.cantidad)}
          </span>
        </div>
      </div>
    </li>
  );
}
