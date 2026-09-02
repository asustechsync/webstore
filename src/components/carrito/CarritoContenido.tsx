"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { LinkButton } from "@/components/ui/LinkButton";
import {
  ajustarLineas,
  calcularAhorroOfertas,
  contarAvisos,
} from "@/features/carrito/revision";
import { calcularDescuentoCupon } from "@/features/cupones/calculo";
import { formatearPrecio } from "@/lib/utils";
import {
  calcularSubtotal,
  filtrarSeleccionados,
  tomarFoto,
  useCartStore,
  type FotoCarrito,
  type ItemCarrito,
} from "@/store/cartStore";
import { AvisoRevision } from "./AvisoRevision";
import { BarraDeshacer } from "./BarraDeshacer";
import { CarritoItem } from "./CarritoItem";
import { GuardadosLista } from "./GuardadosLista";
import { ResumenCarrito } from "./ResumenCarrito";
import { useCarritoHidratado } from "./useCarritoHidratado";
import { useRevisionCarrito } from "./useRevisionCarrito";
import styles from "./carrito.module.css";

/** Cuánto queda a la vista el botón para deshacer la última acción. */
const ESPERA_DESHACER = 8000;

function plural(cantidad: number) {
  return cantidad === 1 ? "producto" : "productos";
}

export function CarritoContenido() {
  const items = useCartStore((estado) => estado.items);
  const guardados = useCartStore((estado) => estado.guardados);
  const seleccionados = useCartStore((estado) => estado.seleccionados);
  const cupon = useCartStore((estado) => estado.cupon);
  const quitarItem = useCartStore((estado) => estado.quitarItem);
  const quitarItems = useCartStore((estado) => estado.quitarItems);
  const guardarParaDespues = useCartStore((estado) => estado.guardarParaDespues);
  const guardarVarios = useCartStore((estado) => estado.guardarVarios);
  const seleccionarTodo = useCartStore((estado) => estado.seleccionarTodo);
  const reemplazarItems = useCartStore((estado) => estado.reemplazarItems);
  const restaurar = useCartStore((estado) => estado.restaurar);

  const hidratado = useCarritoHidratado();
  const { lineas, revisado, cargando, error, verificar } = useRevisionCarrito(items, hidratado);

  const [deshacer, setDeshacer] = useState<{ mensaje: string; foto: FotoCarrito } | null>(null);
  const casillaTodo = useRef<HTMLInputElement>(null);

  // Toda acción que quita algo se puede revertir, así que ninguna pide
  // confirmación: se ejecuta al instante y el aviso se retira solo.
  useEffect(() => {
    if (!deshacer) return;
    const temporizador = setTimeout(() => setDeshacer(null), ESPERA_DESHACER);
    return () => clearTimeout(temporizador);
  }, [deshacer]);

  const marcados = filtrarSeleccionados(items, seleccionados);
  const lineasMarcadas = lineas.filter((linea) => seleccionados.includes(linea.item.varianteId));

  // El estado intermedio de la casilla maestra no se puede declarar en JSX.
  useEffect(() => {
    if (casillaTodo.current) {
      casillaTodo.current.indeterminate = marcados.length > 0 && marcados.length < items.length;
    }
  }, [marcados.length, items.length]);

  function ejecutarConDeshacer(mensaje: string, accion: () => void) {
    const foto = tomarFoto();
    accion();
    setDeshacer({ mensaje, foto });
  }

  const subtotal = calcularSubtotal(marcados);
  const descuento = cupon ? calcularDescuentoCupon(cupon, subtotal) : 0;
  const total = Math.max(subtotal - descuento, 0);
  const ahorroOfertas = calcularAhorroOfertas(lineasMarcadas);
  // Solo bloquea lo que se va a pagar: un producto sin stock que quedó
  // desmarcado no impide comprar el resto.
  const bloqueado = contarAvisos(lineasMarcadas) > 0;

  if (!hidratado) {
    return <p className={styles.cargando}>Cargando tu carrito…</p>;
  }

  const avisoDeshacer = deshacer ? (
    <BarraDeshacer
      mensaje={deshacer.mensaje}
      onDeshacer={() => {
        restaurar(deshacer.foto);
        setDeshacer(null);
      }}
    />
  ) : null;

  if (items.length === 0) {
    return (
      <>
        {avisoDeshacer}
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Agrega productos desde el catálogo y vuelve para completar tu pedido."
          accion={{ href: "/productos", texto: "Ver productos" }}
        />
        <GuardadosLista guardados={guardados} />
      </>
    );
  }

  const idsMarcados = marcados.map((item) => item.varianteId);

  return (
    <>
      {avisoDeshacer}

      <div className={styles.disposicion}>
        <div className={styles.columna}>
          <div className={styles.seleccion}>
            <label className={styles.seleccionTodo}>
              <input
                ref={casillaTodo}
                type="checkbox"
                checked={marcados.length === items.length}
                onChange={(evento) => seleccionarTodo(evento.target.checked)}
              />
              <span>
                {marcados.length} de {items.length}{" "}
                {items.length === 1 ? "producto seleccionado" : "productos seleccionados"}
              </span>
            </label>

            <div className={styles.seleccionAcciones}>
              <button
                type="button"
                className={styles.seleccionAccion}
                disabled={idsMarcados.length === 0}
                onClick={() =>
                  ejecutarConDeshacer(
                    `Guardaste ${idsMarcados.length} ${plural(idsMarcados.length)} para después`,
                    () => guardarVarios(idsMarcados),
                  )
                }
              >
                Guardar para después
              </button>
              <button
                type="button"
                className={styles.seleccionAccion}
                disabled={idsMarcados.length === 0}
                onClick={() =>
                  ejecutarConDeshacer(
                    `Quitaste ${idsMarcados.length} ${plural(idsMarcados.length)}`,
                    () => quitarItems(idsMarcados),
                  )
                }
              >
                Quitar
              </button>
            </div>
          </div>

          <AvisoRevision
            lineas={lineasMarcadas}
            onActualizar={() =>
              reemplazarItems([
                ...ajustarLineas(lineasMarcadas),
                ...items.filter((item) => !seleccionados.includes(item.varianteId)),
              ])
            }
          />

          {error ? (
            <p className={styles.revisionError} role="status">
              No pudimos revisar el stock ahora.{" "}
              <button type="button" className={styles.revisionReintentar} onClick={verificar}>
                Reintentar
              </button>
            </p>
          ) : null}

          <ul className={styles.lista}>
            {lineas.map((linea) => (
              <CarritoItem
                key={linea.item.varianteId}
                linea={linea}
                marcado={seleccionados.includes(linea.item.varianteId)}
                onQuitar={(item: ItemCarrito) =>
                  ejecutarConDeshacer(`Quitaste ${item.nombre}`, () =>
                    quitarItem(item.varianteId),
                  )
                }
                onGuardar={(item: ItemCarrito) =>
                  ejecutarConDeshacer(`Guardaste ${item.nombre} para después`, () =>
                    guardarParaDespues(item.varianteId),
                  )
                }
              />
            ))}
          </ul>

          <p className={styles.estadoRevision} aria-live="polite">
            {cargando
              ? "Revisando stock y precios…"
              : revisado && !bloqueado
                ? "Stock y precios verificados"
                : ""}
          </p>

          <GuardadosLista guardados={guardados} />
        </div>

        <ResumenCarrito
          items={marcados}
          subtotal={subtotal}
          cupon={cupon}
          ahorroOfertas={ahorroOfertas}
          bloqueado={bloqueado}
        />
      </div>

      {/* En móvil el total y el botón de pago quedan siempre a la vista. */}
      <div className={styles.barraMovil}>
        <span className={styles.barraMovilTotal}>
          <span className={styles.barraMovilEtiqueta}>
            Total · {marcados.length} {plural(marcados.length)}
          </span>
          {formatearPrecio(total)}
        </span>
        {bloqueado || marcados.length === 0 ? (
          <Button type="button" anchoCompleto={false} disabled>
            Realizar pedido
          </Button>
        ) : (
          <LinkButton href="/checkout" anchoCompleto={false}>
            Realizar pedido
          </LinkButton>
        )}
      </div>
    </>
  );
}
