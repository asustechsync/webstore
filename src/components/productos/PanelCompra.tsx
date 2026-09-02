"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { IconoAgregar, IconoQuitar } from "@/components/ui/ActionIcons";
import { Button } from "@/components/ui/Button";
import type { DetalleVista, VarianteVista } from "@/features/catalogo/detalle";
import { calcularDescuento, formatearPrecio } from "@/lib/utils";
import { CANTIDAD_MAXIMA, useCartStore } from "@/store/cartStore";
import styles from "./PanelCompra.module.css";

type Seleccion = Record<string, string>;

/** Variante que corresponde exactamente a los valores elegidos. */
function buscarVariante(detalle: DetalleVista, seleccion: Seleccion) {
  const elegidos = detalle.opciones.map((opcion) => seleccion[opcion.clave]);
  if (elegidos.some((valor) => !valor)) return null;
  return (
    detalle.variantes.find((variante) =>
      elegidos.every((valorId) => variante.valores.includes(valorId)),
    ) ?? null
  );
}

function seleccionDeVariante(detalle: DetalleVista, variante: VarianteVista): Seleccion {
  const seleccion: Seleccion = {};
  for (const opcion of detalle.opciones) {
    const valor = opcion.valores.find((v) => variante.valores.includes(v.id));
    if (valor) seleccion[opcion.clave] = valor.id;
  }
  return seleccion;
}

/** Primera variante con stock; si están todas agotadas, la primera de la lista. */
function varianteInicial(detalle: DetalleVista, varianteId: string | null) {
  const pedida = varianteId
    ? detalle.variantes.find((variante) => variante.id === varianteId)
    : undefined;
  return (
    pedida ??
    detalle.variantes.find((variante) => variante.cantidad > 0) ??
    detalle.variantes[0] ??
    null
  );
}

export function PanelCompra({
  producto,
  detalle,
}: {
  producto: {
    id: string;
    nombre: string;
    slug: string;
    precio: number;
    precioOferta: number | null;
    imagenUrl: string | null;
  };
  detalle: DetalleVista;
}) {
  const parametros = useSearchParams();
  const agregarItem = useCartStore((estado) => estado.agregarItem);

  const [seleccion, setSeleccion] = useState<Seleccion>(() => {
    const inicial = varianteInicial(detalle, parametros.get("variante"));
    return inicial ? seleccionDeVariante(detalle, inicial) : {};
  });
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  const variante = buscarVariante(detalle, seleccion);
  const precio = variante?.precio ?? producto.precio;
  const oferta = variante?.precioOferta ?? producto.precioOferta;
  const descuento = calcularDescuento(precio, oferta);
  const precioFinal = descuento != null ? (oferta as number) : precio;

  const stock = variante?.cantidad ?? 0;
  const maximo = Math.min(stock, CANTIDAD_MAXIMA);
  // La cantidad se acota en el render: si cambias a una variante con menos
  // stock, el número que se ve ya es el que se va a agregar.
  const cantidadFinal = Math.min(Math.max(cantidad, 1), Math.max(maximo, 1));
  const agotado = variante != null && stock === 0;
  const quedanPocas = variante != null && stock > 0 && stock <= Math.max(variante.stockMinimo, 3);

  function elegir(clave: string, valorId: string) {
    setSeleccion((actual) => ({ ...actual, [clave]: valorId }));
    setAgregado(false);
  }

  function cambiarCantidad(nueva: number) {
    setCantidad(Math.min(Math.max(nueva, 1), Math.max(maximo, 1)));
    setAgregado(false);
  }

  /** Con el resto de la selección fija, ¿esta combinación existe y tiene stock? */
  function estadoValor(clave: string, valorId: string) {
    const otros = detalle.opciones
      .filter((opcion) => opcion.clave !== clave)
      .map((opcion) => seleccion[opcion.clave])
      .filter(Boolean);
    const compatibles = detalle.variantes.filter(
      (v) => v.valores.includes(valorId) && otros.every((id) => v.valores.includes(id)),
    );
    return {
      existe: compatibles.length > 0,
      conStock: compatibles.some((v) => v.cantidad > 0),
    };
  }

  function agregar() {
    if (!variante || stock === 0) return;
    agregarItem(
      {
        varianteId: variante.id,
        productoId: producto.id,
        nombre: producto.nombre,
        slug: producto.slug,
        talla: variante.talla,
        color: variante.color,
        precio: precioFinal,
        imagenUrl: producto.imagenUrl,
      },
      cantidadFinal,
    );
    setAgregado(true);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.precios}>
        {descuento != null ? (
          <>
            <span className={styles.precioRebajado}>{formatearPrecio(precioFinal)}</span>
            <span className={styles.precioAnterior}>{formatearPrecio(precio)}</span>
            <span className={styles.etiquetaOferta}>-{descuento}%</span>
          </>
        ) : (
          <span className={styles.precio}>{formatearPrecio(precio)}</span>
        )}
      </div>

      {detalle.opciones.map((opcion) => {
        const elegido = seleccion[opcion.clave];
        const nombreElegido = opcion.valores.find((valor) => valor.id === elegido)?.valor;

        return (
          <fieldset key={opcion.clave} className={styles.opcion}>
            <legend className={styles.opcionTitulo}>
              {opcion.nombre}
              {nombreElegido ? <span className={styles.opcionElegida}>{nombreElegido}</span> : null}
            </legend>

            <div className={styles.valores}>
              {opcion.valores.map((valor) => {
                const estado = estadoValor(opcion.clave, valor.id);
                const activo = elegido === valor.id;

                return (
                  <button
                    key={valor.id}
                    type="button"
                    className={`${styles.valor} ${activo ? styles.valorActivo : ""} ${
                      estado.existe && !estado.conStock ? styles.valorAgotado : ""
                    }`}
                    onClick={() => elegir(opcion.clave, valor.id)}
                    disabled={!estado.existe}
                    aria-pressed={activo}
                  >
                    {opcion.esColor && valor.hex ? (
                      <span
                        className={styles.muestra}
                        style={{ background: valor.hex }}
                        aria-hidden="true"
                      />
                    ) : null}
                    {valor.valor}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <p className={styles.stock} aria-live="polite">
        {variante == null ? (
          <span className={styles.sinCombinacion}>Esa combinación no está disponible</span>
        ) : agotado ? (
          <span className={styles.agotado}>Sin stock</span>
        ) : quedanPocas ? (
          <span className={styles.pocas}>
            Quedan {stock} unidad{stock === 1 ? "" : "es"}
          </span>
        ) : (
          <span className={styles.disponible}>Disponible</span>
        )}
      </p>

      <div className={styles.compra}>
        <div className={styles.cantidad}>
          <button
            type="button"
            className={styles.cantidadBoton}
            onClick={() => cambiarCantidad(cantidadFinal - 1)}
            disabled={cantidadFinal <= 1 || agotado}
            aria-label="Quitar una unidad"
          >
            <IconoQuitar />
          </button>
          <span className={styles.cantidadValor}>{cantidadFinal}</span>
          <button
            type="button"
            className={styles.cantidadBoton}
            onClick={() => cambiarCantidad(cantidadFinal + 1)}
            disabled={cantidadFinal >= maximo || agotado}
            aria-label="Agregar una unidad"
          >
            <IconoAgregar />
          </button>
        </div>

        <Button
          onClick={agregar}
          disabled={variante == null || agotado}
          className={styles.botonAgregar}
        >
          {agotado ? "Sin stock" : "Agregar al carrito"}
        </Button>
      </div>

      {agregado ? (
        <p className={styles.confirmacion} role="status">
          Agregado al carrito.{" "}
          <Link href="/carrito" className={styles.enlaceCarrito}>
            Ver carrito
          </Link>
        </p>
      ) : null}

      {variante ? (
        <dl className={styles.ficha}>
          <div>
            <dt>SKU</dt>
            <dd>{variante.sku}</dd>
          </div>
          <div>
            <dt>Selección</dt>
            <dd>{variante.etiqueta}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
