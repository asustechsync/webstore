"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EstadoPedido } from "@prisma/client";
import { cambiarEstadoPedido, eliminarPedido } from "@/features/pedidos/actions";
import { sePuedeEliminar } from "@/features/pedidos/estado";
import { SelectConFlecha } from "@/components/ui/SelectConFlecha";
import { IconoEliminar, IconoFlecha } from "@/components/ui/ActionIcons";
import styles from "../admin.module.css";

type ProductoResumen = {
  id: string;
  nombre: string;
  /** "Talla: M · Color: Negro"; el SKU si el pedido no guardó opciones. */
  opciones: string;
  cantidad: number;
  precioUnit: string;
  subtotal: string;
};

type ResumenPedido = {
  subtotal: string;
  descuento: string | null;
  costoEnvio: string | null;
  total: string;
  cupon: string | null;
  metodoPago: string;
  envio: {
    destinatario: string;
    telefono: string;
    direccion: string;
    referencia: string;
    distrito: string;
    provincia: string;
    departamento: string;
  } | null;
  productos: ProductoResumen[];
};

type Fila = {
  id: string;
  cliente: string;
  correo: string;
  telefono: string | null;
  total: string;
  estado: EstadoPedido;
  items: number;
  creadoEn: string;
  resumen: ResumenPedido;
};

const ESTADOS: EstadoPedido[] = [
  "PENDIENTE",
  "PAGADO",
  "EN_PREPARACION",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

const COLUMNAS = 8;

export function PedidosTabla({ pedidos }: { pedidos: Fila[] }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  function onCambiarEstado(id: string, estado: EstadoPedido) {
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await cambiarEstadoPedido(id, estado);
      if (!resultado.ok) setError(resultado.error);
      router.refresh();
    });
  }

  function onEliminar(pedido: Fila) {
    const aviso =
      `¿Eliminar el pedido ${pedido.id.slice(0, 8)} de ${pedido.cliente || pedido.correo}?\n\n` +
      "Se devolverán las unidades al stock y el uso del cupón. " +
      "El pedido no se podrá recuperar.";
    if (!confirm(aviso)) return;

    setError(null);
    iniciarTransicion(async () => {
      const resultado = await eliminarPedido(pedido.id);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      // La fila desaparece: si era la expandida, el detalle ya no existe.
      setExpandidoId((actual) => (actual === pedido.id ? null : actual));
      router.refresh();
    });
  }

  if (pedidos.length === 0) {
    return <p className={styles.vacio}>Todavía no hay pedidos.</p>;
  }

  return (
    <>
      {error && <p className={styles.mensajeError}>{error}</p>}

      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th />
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => {
              const expandido = pedido.id === expandidoId;

              return (
                <Fragment key={pedido.id}>
                  <tr
                    className={expandido ? styles.filaSeleccionada : undefined}
                    onClick={() => setExpandidoId((actual) => (actual === pedido.id ? null : pedido.id))}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <IconoFlecha
                        className={`${styles.filaExpandirIcono} ${expandido ? styles.filaExpandirIconoAbierta : ""}`}
                      />
                    </td>
                    <td>{pedido.id.slice(0, 8)}</td>
                    <td>{pedido.cliente}</td>
                    <td>{pedido.items}</td>
                    <td>{pedido.total}</td>
                    <td>{pedido.creadoEn}</td>
                    <td onClick={(evento) => evento.stopPropagation()}>
                      <SelectConFlecha
                        className={styles.control}
                        value={pedido.estado}
                        disabled={pendiente}
                        onChange={(evento) =>
                          onCambiarEstado(pedido.id, evento.target.value as EstadoPedido)
                        }
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado.replace("_", " ")}
                          </option>
                        ))}
                      </SelectConFlecha>
                    </td>
                    <td onClick={(evento) => evento.stopPropagation()}>
                      <div className={styles.acciones}>
                        {/* Un pedido pagado o entregado ya es historial de
                            ventas: se deshabilita en vez de ocultarse para que
                            el motivo quede a la vista. */}
                        <button
                          type="button"
                          className={styles.botonIcono}
                          disabled={pendiente || !sePuedeEliminar(pedido.estado)}
                          title={
                            sePuedeEliminar(pedido.estado)
                              ? "Eliminar pedido"
                              : "Solo se pueden eliminar pedidos pendientes o cancelados"
                          }
                          aria-label={`Eliminar el pedido ${pedido.id.slice(0, 8)}`}
                          onClick={() => onEliminar(pedido)}
                        >
                          <IconoEliminar />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandido && (
                    <tr className={styles.filaVariantes}>
                      <td colSpan={COLUMNAS}>
                        <ResumenPedido pedido={pedido} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ResumenPedido({ pedido }: { pedido: Fila }) {
  const { resumen } = pedido;

  return (
    <div className={styles.resumenPedido}>
      <div className={styles.resumenPedidoColumnas}>
        <div>
          <h3 className={styles.resumenPedidoTitulo}>Cliente</h3>
          <dl className={styles.previaDatos}>
            <div>
              <dt>Nombre</dt>
              <dd>{pedido.cliente || "—"}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{pedido.correo}</dd>
            </div>
            {pedido.telefono && (
              <div>
                <dt>Teléfono</dt>
                <dd>{pedido.telefono}</dd>
              </div>
            )}
          </dl>
        </div>

        <div>
          <h3 className={styles.resumenPedidoTitulo}>Envío</h3>
          {resumen.envio ? (
            <dl className={styles.previaDatos}>
              <div>
                <dt>Recibe</dt>
                <dd>
                  {resumen.envio.destinatario}
                  {resumen.envio.telefono ? ` · ${resumen.envio.telefono}` : ""}
                </dd>
              </div>
              <div>
                <dt>Dirección</dt>
                <dd>
                  {resumen.envio.direccion}
                  {resumen.envio.referencia ? ` · ${resumen.envio.referencia}` : ""}
                </dd>
              </div>
              <div>
                <dt>Zona</dt>
                <dd>
                  {[resumen.envio.distrito, resumen.envio.provincia, resumen.envio.departamento]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
              </div>
            </dl>
          ) : (
            <p className={styles.vacio}>Sin dirección de envío.</p>
          )}
        </div>

        <div>
          <h3 className={styles.resumenPedidoTitulo}>Pago</h3>
          <dl className={styles.previaDatos}>
            <div>
              <dt>Método</dt>
              <dd>{resumen.metodoPago}</dd>
            </div>
            {resumen.cupon && (
              <div>
                <dt>Cupón</dt>
                <dd>{resumen.cupon}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <table className={styles.tablaVariantesProducto}>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {resumen.productos.map((producto) => (
            <tr key={producto.id}>
              <td>
                {producto.nombre}
                <span className={styles.resumenPedidoOpciones}>{producto.opciones}</span>
              </td>
              <td>{producto.cantidad}</td>
              <td>{producto.precioUnit}</td>
              <td>{producto.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className={styles.resumenPedidoTotales}>
        <div>
          <dt>Subtotal</dt>
          <dd>{resumen.subtotal}</dd>
        </div>
        {resumen.descuento && (
          <div>
            <dt>Descuento</dt>
            <dd>−{resumen.descuento}</dd>
          </div>
        )}
        <div>
          <dt>Envío</dt>
          <dd>{resumen.costoEnvio ?? "Sin costo"}</dd>
        </div>
        <div className={styles.resumenPedidoTotalFinal}>
          <dt>Total</dt>
          <dd>{resumen.total}</dd>
        </div>
      </dl>
    </div>
  );
}
