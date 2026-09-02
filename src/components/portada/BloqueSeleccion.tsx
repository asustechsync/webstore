import Image from "next/image";
import Link from "next/link";
import type { ProductoCardData } from "@/components/productos/ProductoCard";
import { calcularDescuento, formatearPrecio } from "@/lib/utils";
import styles from "./BloqueSeleccion.module.css";

function Precio({ producto }: { producto: ProductoCardData }) {
  const descuento = calcularDescuento(producto.precio, producto.precioOferta);
  if (descuento == null) return <span className={styles.precio}>{formatearPrecio(producto.precio)}</span>;

  return (
    <>
      <span className={styles.precioRebajado}>
        {formatearPrecio(producto.precioOferta as string)}
      </span>
      <span className={styles.precioAnterior}>{formatearPrecio(producto.precio)}</span>
    </>
  );
}

/**
 * Selección editorial: un producto en grande y el resto en una lista lateral.
 * Rompe el ritmo de las grillas para que la portada no sea una sucesión de
 * filas iguales.
 */
export function BloqueSeleccion({
  principal,
  secundarios,
}: {
  principal: ProductoCardData;
  secundarios: ProductoCardData[];
}) {
  const imagenPrincipal = principal.imagenes[0]?.url;

  return (
    <div className={styles.bloque}>
      <Link href={`/productos/${principal.slug}`} className={styles.principal}>
        <div className={styles.principalImagen}>
          {imagenPrincipal ? (
            <Image
              src={imagenPrincipal}
              alt={principal.nombre}
              fill
              sizes="(min-width: 64rem) 55vw, 100vw"
              className={styles.imagen}
            />
          ) : null}
        </div>
        <div className={styles.principalTexto}>
          {principal.marca ? <p className={styles.marca}>{principal.marca.nombre}</p> : null}
          <h3 className={styles.principalNombre}>{principal.nombre}</h3>
          <div className={styles.precios}>
            <Precio producto={principal} />
          </div>
        </div>
      </Link>

      {secundarios.length > 0 ? (
        <ul className={styles.lista}>
          {secundarios.map((producto) => {
            const imagen = producto.imagenes[0]?.url;
            return (
              <li key={producto.varianteId ?? producto.slug}>
                <Link href={`/productos/${producto.slug}`} className={styles.fila}>
                  <div className={styles.filaImagen}>
                    {imagen ? (
                      <Image
                        src={imagen}
                        alt=""
                        fill
                        sizes="96px"
                        className={styles.imagen}
                      />
                    ) : null}
                  </div>
                  <div className={styles.filaTexto}>
                    {producto.marca ? <p className={styles.marca}>{producto.marca.nombre}</p> : null}
                    <p className={styles.filaNombre}>{producto.nombre}</p>
                    <div className={styles.precios}>
                      <Precio producto={producto} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
