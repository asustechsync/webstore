"use client";

import Image from "next/image";
import Link from "next/link";
import { IconoEliminar } from "@/components/ui/ActionIcons";
import { formatearPrecio } from "@/lib/utils";
import { useCartStore, type ItemCarrito } from "@/store/cartStore";
import styles from "./carrito.module.css";

/**
 * Lo apartado con "guardar para después": no suma al total ni bloquea el
 * pago, pero sigue a la vista con su talla y su color para volver a subirlo
 * al carrito de un toque.
 */
export function GuardadosLista({ guardados }: { guardados: ItemCarrito[] }) {
  const moverAlCarrito = useCartStore((estado) => estado.moverAlCarrito);
  const quitarGuardado = useCartStore((estado) => estado.quitarGuardado);

  if (guardados.length === 0) return null;

  return (
    <section className={styles.guardados} aria-labelledby="titulo-guardados">
      <h2 id="titulo-guardados" className={styles.guardadosTitulo}>
        Guardados para después
        <span className={styles.guardadosCuenta}>{guardados.length}</span>
      </h2>

      <ul className={styles.guardadosLista}>
        {guardados.map((item) => {
          const opciones = [item.talla, item.color].filter(Boolean).join(" / ");

          return (
            <li key={item.varianteId} className={styles.guardado}>
              <Link
                href={`/productos/${item.slug}?variante=${item.varianteId}`}
                className={styles.guardadoImagen}
                aria-hidden="true"
                tabIndex={-1}
              >
                {item.imagenUrl ? (
                  <Image src={item.imagenUrl} alt="" fill sizes="64px" className={styles.imagen} />
                ) : null}
              </Link>

              <div className={styles.guardadoTextos}>
                <Link
                  href={`/productos/${item.slug}?variante=${item.varianteId}`}
                  className={styles.itemNombre}
                >
                  {item.nombre}
                </Link>
                <p className={styles.itemOpciones}>
                  {[opciones, formatearPrecio(item.precio)].filter(Boolean).join(" · ")}
                </p>
              </div>

              <div className={styles.guardadoAcciones}>
                <button
                  type="button"
                  className={styles.guardadoMover}
                  onClick={() => moverAlCarrito(item.varianteId)}
                >
                  Mover al carrito
                </button>
                <button
                  type="button"
                  className={styles.itemQuitar}
                  onClick={() => quitarGuardado(item.varianteId)}
                  aria-label={`Quitar ${item.nombre} de guardados`}
                >
                  <IconoEliminar />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
