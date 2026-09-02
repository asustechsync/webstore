"use client";

import Image from "next/image";
import Link from "next/link";
import { IconoAgregar, IconoCerrar, IconoQuitar, IconoStockBajo } from "@/components/ui/ActionIcons";
import { describirAviso, type LineaRevisada } from "@/features/carrito/revision";
import { CANTIDAD_MAXIMA, useCartStore, type ItemCarrito } from "@/store/cartStore";
import { formatearPrecio } from "@/lib/utils";
import styles from "./carrito.module.css";

/** Desde acá quedan pocas unidades y conviene decirlo. */
const STOCK_BAJO = 5;

export function CarritoItem({
  linea,
  marcado,
  onQuitar,
  onGuardar,
}: {
  linea: LineaRevisada<ItemCarrito>;
  /** Marcada para pagar: solo estas suman en el detalle del precio. */
  marcado: boolean;
  onQuitar: (item: ItemCarrito) => void;
  onGuardar: (item: ItemCarrito) => void;
}) {
  const { item, info, avisos } = linea;
  const actualizarCantidad = useCartStore((estado) => estado.actualizarCantidad);
  const alternarSeleccion = useCartStore((estado) => estado.alternarSeleccion);

  const enlace = `/productos/${item.slug}?variante=${item.varianteId}`;

  // Sin revisión todavía se usa el tope general; con ella, el stock real.
  const maximo = info ? Math.min(info.stock, CANTIDAD_MAXIMA) : CANTIDAD_MAXIMA;
  const comprable = info == null || (info.activa && info.stock > 0);
  // Precio de lista solo cuando la variante está rebajada, y stock solo
  // cuando queda poco y todavía alcanza: así el JSX no repite condiciones.
  const precioAnterior = info != null && info.precioLista > item.precio ? info.precioLista : null;
  const stockBajo =
    comprable && info != null && info.stock <= STOCK_BAJO && item.cantidad <= info.stock
      ? info.stock
      : null;

  const etiquetas = [
    item.talla ? `Talla ${item.talla}` : null,
    item.color ? item.color : null,
    "Envío con Shalom",
  ].filter((etiqueta): etiqueta is string => etiqueta !== null);

  /**
   * La cantidad también se escribe: es más rápido que pulsar diez veces. El
   * campo no se controla mientras se teclea (así se puede borrar para
   * escribir otro número) y al salir se acota al stock, corrigiendo de paso
   * lo que se haya escrito de más.
   */
  function confirmarCantidad(campo: HTMLInputElement) {
    const escrito = Number.parseInt(campo.value, 10);
    const acotada =
      Number.isFinite(escrito) && escrito >= 1
        ? Math.min(escrito, Math.max(maximo, 1))
        : item.cantidad;

    campo.value = String(acotada);
    if (acotada !== item.cantidad) actualizarCantidad(item.varianteId, acotada);
  }

  return (
    <li className={`${styles.item} ${comprable ? "" : styles.itemInactivo}`}>
      <input
        type="checkbox"
        className={styles.itemMarca}
        checked={marcado}
        onChange={() => alternarSeleccion(item.varianteId)}
        disabled={!comprable}
        aria-label={`Incluir ${item.nombre} en el pedido`}
      />

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
            <ul className={styles.itemEtiquetas}>
              {etiquetas.map((etiqueta) => (
                <li key={etiqueta} className={styles.itemEtiqueta}>
                  {etiqueta}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className={styles.itemQuitar}
            onClick={() => onQuitar(item)}
            aria-label={`Quitar ${item.nombre} del carrito`}
          >
            <IconoCerrar />
          </button>
        </div>

        {avisos.length > 0 || stockBajo != null ? (
          <ul className={styles.itemAvisos}>
            {avisos.map((aviso) => (
              <li key={aviso.tipo} className={styles.itemAviso}>
                <IconoStockBajo className={styles.itemAvisoIcono} />
                {describirAviso(aviso)}
              </li>
            ))}
            {stockBajo != null ? (
              <li className={styles.itemNota}>
                Quedan {stockBajo} {stockBajo === 1 ? "unidad" : "unidades"}
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className={styles.itemAcciones}>
          <p className={styles.itemPrecio}>
            {formatearPrecio(item.precio * item.cantidad)}
            {precioAnterior != null ? (
              <span className={styles.itemPrecioAnterior}>
                {formatearPrecio(precioAnterior * item.cantidad)}
              </span>
            ) : null}
            {item.cantidad > 1 ? (
              <span className={styles.itemUnitario}>{formatearPrecio(item.precio)} c/u</span>
            ) : null}
          </p>

          <div className={styles.cantidad}>
            <button
              type="button"
              className={styles.cantidadBoton}
              onClick={() => actualizarCantidad(item.varianteId, item.cantidad - 1)}
              disabled={item.cantidad <= 1 || !comprable}
              aria-label="Quitar una unidad"
            >
              <IconoQuitar />
            </button>
            <input
              // Al cambiar la cantidad desde fuera (los botones, o el ajuste
              // del carrito) el campo se vuelve a montar con el valor nuevo.
              key={item.cantidad}
              className={styles.cantidadValor}
              // Sin caja propia: la caja es el selector que lo rodea.
              data-plano=""
              defaultValue={item.cantidad}
              onChange={(evento) => {
                evento.target.value = evento.target.value.replace(/\D/g, "");
              }}
              onBlur={(evento) => confirmarCantidad(evento.currentTarget)}
              onKeyDown={(evento) => {
                if (evento.key !== "Enter") return;
                // Enter confirma sin esperar a que el campo pierda el foco.
                evento.preventDefault();
                confirmarCantidad(evento.currentTarget);
                evento.currentTarget.blur();
              }}
              inputMode="numeric"
              maxLength={2}
              autoComplete="off"
              disabled={!comprable}
              aria-label={`Cantidad de ${item.nombre}`}
            />
            <button
              type="button"
              className={styles.cantidadBoton}
              onClick={() => actualizarCantidad(item.varianteId, item.cantidad + 1)}
              disabled={item.cantidad >= maximo || !comprable}
              aria-label="Agregar una unidad"
            >
              <IconoAgregar />
            </button>
          </div>
        </div>

        <button type="button" className={styles.itemGuardar} onClick={() => onGuardar(item)}>
          Guardar para después
        </button>
      </div>
    </li>
  );
}
