"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./GaleriaProducto.module.css";

/**
 * Galería del detalle: una imagen grande y la tira de miniaturas. En móvil las
 * miniaturas se deslizan bajo la imagen; desde 1024 px pasan a una columna
 * vertical a la izquierda.
 */
export function GaleriaProducto({
  imagenes,
  nombre,
}: {
  imagenes: { id: string; url: string }[];
  nombre: string;
}) {
  const [activa, setActiva] = useState(0);
  const imagen = imagenes[activa];

  return (
    <div className={styles.galeria}>
      <div className={styles.principal}>
        {imagen ? (
          <Image
            src={imagen.url}
            alt={nombre}
            fill
            priority
            sizes="(min-width: 64rem) 55vw, 100vw"
            className={styles.imagen}
          />
        ) : (
          <div className={styles.sinImagen}>Sin imagen</div>
        )}
      </div>

      {imagenes.length > 1 ? (
        <ul className={styles.miniaturas} aria-label={`Imágenes de ${nombre}`}>
          {imagenes.map((item, indice) => (
            <li key={item.id}>
              <button
                type="button"
                className={`${styles.miniatura} ${indice === activa ? styles.miniaturaActiva : ""}`}
                onClick={() => setActiva(indice)}
                aria-label={`Ver imagen ${indice + 1} de ${imagenes.length}`}
                aria-current={indice === activa}
              >
                <Image src={item.url} alt="" fill sizes="96px" className={styles.imagen} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
