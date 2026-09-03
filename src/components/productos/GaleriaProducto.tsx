"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useVarianteOpcional } from "./ContextoVariante";
import styles from "./GaleriaProducto.module.css";

type ImagenProducto = { id: string; url: string };

type Diapositiva = {
  id: string;
  url: string;
  /** Presente si la foto pertenece a una variante: tocarla la selecciona. */
  varianteId?: string;
  etiqueta: string;
};

/**
 * Galería del detalle: una imagen grande y, debajo, la tira de miniaturas en
 * cuatro columnas.
 *
 * No hay foto de portada. Manda la variante: primero va la foto del color
 * elegido, después la del resto de colores —tocarlas cambia de variante— y al
 * final las imágenes sueltas del producto, en el orden que fijó el
 * administrador. Así la misma foto no aparece dos veces por estar cargada como
 * portada y como foto de un color.
 */
export function GaleriaProducto({
  imagenes,
  nombre,
}: {
  imagenes: ImagenProducto[];
  nombre: string;
}) {
  // La galería también sirve fuera de la ficha de producto, donde no hay
  // variante elegida; por eso el contexto es opcional.
  const contexto = useVarianteOpcional();
  const varianteActivaId = contexto?.variante?.id ?? null;
  const variantes = contexto?.detalle.variantes;

  const lista = useMemo<Diapositiva[]>(() => {
    const conFoto = (variantes ?? []).filter((variante) => variante.imagenUrl);
    // La del color elegido encabeza; el resto conserva su orden natural.
    const ordenadas = [
      ...conFoto.filter((variante) => variante.id === varianteActivaId),
      ...conFoto.filter((variante) => variante.id !== varianteActivaId),
    ];

    const diapositivas: Diapositiva[] = ordenadas.map((variante) => ({
      id: `variante:${variante.id}`,
      url: variante.imagenUrl as string,
      varianteId: variante.id,
      etiqueta: variante.etiqueta,
    }));

    const yaEstan = new Set(diapositivas.map((diapositiva) => diapositiva.url));
    for (const imagen of imagenes) {
      if (yaEstan.has(imagen.url)) continue;
      diapositivas.push({ id: imagen.id, url: imagen.url, etiqueta: nombre });
    }

    return diapositivas;
  }, [imagenes, nombre, variantes, varianteActivaId]);

  // La elección manual solo vale mientras no se cambie de variante: al elegir
  // otro color la imagen grande vuelve a ser la de ese color.
  const [manual, setManual] = useState<{ varianteId: string | null; url: string } | null>(null);
  const activa =
    manual && manual.varianteId === varianteActivaId && lista.some((d) => d.url === manual.url)
      ? manual.url
      : (lista[0]?.url ?? null);
  const imagen = lista.find((diapositiva) => diapositiva.url === activa) ?? lista[0];

  function mostrar(diapositiva: Diapositiva) {
    setManual({ varianteId: varianteActivaId, url: diapositiva.url });
    // Tocar la foto de otro color equivale a elegir ese color en el
    // configurador: el precio y el stock de la derecha se mueven con ella.
    if (diapositiva.varianteId && diapositiva.varianteId !== varianteActivaId) {
      contexto?.seleccionarVariante(diapositiva.varianteId);
    }
  }

  return (
    <div className={styles.galeria}>
      <div className={styles.principal}>
        {imagen ? (
          <Image
            src={imagen.url}
            alt={nombre}
            fill
            priority
            sizes="(min-width: 80rem) 34vw, (min-width: 48rem) 45vw, 100vw"
            className={styles.imagen}
          />
        ) : (
          <div className={styles.sinImagen}>Sin imagen</div>
        )}
      </div>

      {lista.length > 1 ? (
        <ul className={styles.miniaturas} aria-label={`Imágenes de ${nombre}`}>
          {lista.map((diapositiva) => (
            <li key={diapositiva.id}>
              <button
                type="button"
                className={`${styles.miniatura} ${diapositiva.url === activa ? styles.miniaturaActiva : ""}`}
                onClick={() => mostrar(diapositiva)}
                aria-label={`Ver ${diapositiva.etiqueta}`}
                aria-current={diapositiva.url === activa}
              >
                <Image
                  src={diapositiva.url}
                  alt=""
                  fill
                  sizes="(min-width: 80rem) 120px, (min-width: 48rem) 12vw, 25vw"
                  className={styles.imagen}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
