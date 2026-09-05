"use client";

import Link from "next/link";
import { useState } from "react";
import { IconoAgregar, IconoBolsa, IconoQuitar } from "@/components/ui/ActionIcons";
import { Button } from "@/components/ui/Button";
import { ENTREGA, estimarEntrega, type RangoEntrega } from "@/features/catalogo/entrega";
import { useHidratado } from "@/components/ui/useHidratado";
import { useVariante } from "./ContextoVariante";
import type { DetalleVista } from "@/features/catalogo/detalle";
import { calcularDescuento, formatearPrecio } from "@/lib/utils";
import { CANTIDAD_MAXIMA, useCartStore } from "@/store/cartStore";
import styles from "./PanelCompra.module.css";

/**
 * Zona interactiva de la ficha de producto.
 *
 * Reúne el configurador y la caja de compra en un solo componente porque
 * comparten la variante elegida: el precio, el stock y la fecha de entrega de
 * la derecha dependen de la talla y el color que se elijan en el centro.
 * `children` es el encabezado que arma el servidor (marca, título, SKU), que
 * entra tal cual arriba de la columna central.
 */
export function PanelCompra({
  producto,
  detalle,
  children,
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
  children?: React.ReactNode;
}) {
  const agregarItem = useCartStore((estado) => estado.agregarItem);
  const { seleccion, elegir: elegirVariante, variante } = useVariante();

  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  /*
   * La fecha de entrega se calcula en el navegador, no en el servidor.
   *
   * La ficha ahora es HTML pre-construido: si el rango se calculara al
   * renderizar, quedaría congelado en la fecha del build y en dos semanas
   * seguiría prometiendo la misma semana de entrega. Contando desde el
   * navegador siempre sale desde hoy.
   *
   * Hasta hidratar la tarjeta de envío muestra el plazo en días hábiles, que
   * es correcto en ambos lados y evita el desajuste.
   */
  const hidratado = useHidratado();
  const entrega: RangoEntrega | null = hidratado ? estimarEntrega() : null;

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

  const ahorro = descuento != null ? precio - precioFinal : 0;
  const totalLinea = precioFinal * cantidadFinal;
  const envioGratis = totalLinea >= ENTREGA.envioGratisDesde;
  const cuota = precioFinal >= ENTREGA.cuotasDesde ? precioFinal / ENTREGA.cuotasMaximas : null;

  function elegir(clave: string, valorId: string) {
    elegirVariante(clave, valorId);
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
        // La miniatura del carrito y del pedido debe ser la del color que
        // se compró; solo cae a la del producto si la variante no tiene.
        imagenUrl: variante.imagenUrl ?? producto.imagenUrl,
      },
      cantidadFinal,
    );
    setAgregado(true);
  }

  return (
    <div className={styles.columnas}>
      <div className={styles.info}>
        {children}

        {detalle.opciones.length > 0 ? (
          <section className={styles.configurador} aria-labelledby="titulo-configurador">
            <h2 id="titulo-configurador" className={styles.configuradorTitulo}>
              Arma tu pedido
            </h2>

            {detalle.opciones.map((opcion) => {
              const elegido = seleccion[opcion.clave];
              const nombreElegido = opcion.valores.find((valor) => valor.id === elegido)?.valor;

              return (
                <fieldset key={opcion.clave} className={styles.opcion}>
                  <legend className={styles.opcionTitulo}>
                    {opcion.nombre}:
                    <span className={styles.opcionElegida}>{nombreElegido ?? "elige una"}</span>
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
          </section>
        ) : null}
      </div>

      <aside className={styles.caja} aria-label="Compra">
        <div className={styles.precios}>
          {descuento != null ? (
            <>
              <span className={styles.precioRebajado}>{formatearPrecio(precioFinal)}</span>
              <span className={styles.precioAnterior}>{formatearPrecio(precio)}</span>
            </>
          ) : (
            <span className={styles.precio}>{formatearPrecio(precio)}</span>
          )}
        </div>

        {descuento != null ? (
          <p className={styles.ahorro}>
            Ahorras {formatearPrecio(ahorro)} · {descuento}% de descuento
          </p>
        ) : null}

        {cuota ? (
          <p className={styles.cuotas}>
            o hasta {ENTREGA.cuotasMaximas} cuotas de {formatearPrecio(cuota)} con tu tarjeta
          </p>
        ) : null}

        <section className={styles.disponibilidad}>
          <h2 className={styles.cajaTitulo}>Disponibilidad</h2>

          <div className={styles.entregas}>
            <div
              className={`${styles.entrega} ${ENTREGA.recojoEnTienda ? "" : styles.entregaApagada}`}
            >
              <IconoBolsa />
              <span className={styles.entregaNombre}>Recojo en tienda</span>
              <span className={styles.entregaDato}>
                {ENTREGA.recojoEnTienda ? "Disponible" : "No disponible"}
              </span>
            </div>

            <div
              className={`${styles.entrega} ${agotado ? styles.entregaApagada : styles.entregaActiva}`}
            >
              <IconoBolsa />
              <span className={styles.entregaNombre}>Envío a domicilio</span>
              <span className={styles.entregaDato}>
                {agotado
                  ? "Sin stock"
                  : entrega
                    ? `Llega del ${entrega.desde} al ${entrega.hasta}`
                    : `Llega en ${ENTREGA.diasHabilesMinimo} a ${ENTREGA.diasHabilesMaximo} días hábiles`}
              </span>
            </div>
          </div>

          <p className={styles.envio}>
            {envioGratis
              ? "Envío gratis en este pedido"
              : `Envío gratis desde ${formatearPrecio(ENTREGA.envioGratisDesde)}`}
          </p>
        </section>

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

        <p className={styles.vendido}>
          Vendido por <strong>Webstore</strong> · Pago seguro con Izipay
        </p>
      </aside>
    </div>
  );
}
