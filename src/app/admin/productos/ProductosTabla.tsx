"use client";

import Link from "next/link";
import { IconoDisponible, IconoSinStock, IconoStockBajo } from "@/components/ui/ActionIcons";
import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  alternarActivoProducto,
  alternarActivoVariante,
  duplicarProducto,
  eliminarProducto,
} from "@/features/catalogo/actions";
import styles from "../admin.module.css";
import { IconoEditar, IconoClonar, IconoEliminar } from "@/components/ui/ActionIcons";

type Fila = {
  id: string;
  nombre: string;
  sku: string;
  precio: string;
  activo: boolean;
  stock: number;
  stockBajo: boolean;
  variantes: Array<{
    id: string;
    opciones: string;
    sku: string;
    precio: string;
    cantidad: number;
    stockMinimo: number;
    activo: boolean;
  }>;
};

export function ProductosTabla({
  productos,
  seleccionadoId,
  onSeleccionar,
}: {
  productos: Fila[];
  seleccionadoId?: string | null;
  onSeleccionar?: (id: string) => void;
}) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [visibilidadProductos, setVisibilidadProductos] = useState<Record<string, boolean>>({});
  const [visibilidadVariantes, setVisibilidadVariantes] = useState<Record<string, boolean>>({});
  const [guardandoVisibilidad, setGuardandoVisibilidad] = useState<Record<string, true>>({});

  function correr(accion: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await accion();
      if (!resultado.ok) setError(resultado.error ?? "Ocurrió un error");
      router.refresh();
    });
  }

  function onEliminar(producto: Fila) {
    if (!confirm(`¿Eliminar el producto "${producto.nombre}" y todas sus tallas?`)) return;
    correr(() => eliminarProducto(producto.id));
  }

  async function cambiarVisibilidadProducto(id: string, activo: boolean, anterior: boolean) {
    setError(null);
    setVisibilidadProductos((actual) => ({ ...actual, [id]: activo }));
    setGuardandoVisibilidad((actual) => ({ ...actual, [id]: true }));

    try {
      const resultado = await alternarActivoProducto(id, activo);
      if (resultado.ok) return;
      setVisibilidadProductos((actual) => ({ ...actual, [id]: anterior }));
      setError(resultado.error ?? "No se pudo actualizar la visibilidad");
    } catch {
      setVisibilidadProductos((actual) => ({ ...actual, [id]: anterior }));
      setError("No se pudo conectar para actualizar la visibilidad");
    } finally {
      setGuardandoVisibilidad((actual) => {
        const { [id]: _, ...resto } = actual;
        return resto;
      });
    }
  }

  async function cambiarVisibilidadVariante(id: string, activo: boolean, anterior: boolean) {
    setError(null);
    setVisibilidadVariantes((actual) => ({ ...actual, [id]: activo }));
    setGuardandoVisibilidad((actual) => ({ ...actual, [id]: true }));

    try {
      const resultado = await alternarActivoVariante(id, activo);
      if (resultado.ok) return;
      setVisibilidadVariantes((actual) => ({ ...actual, [id]: anterior }));
      setError(resultado.error ?? "No se pudo actualizar la visibilidad");
    } catch {
      setVisibilidadVariantes((actual) => ({ ...actual, [id]: anterior }));
      setError("No se pudo conectar para actualizar la visibilidad");
    } finally {
      setGuardandoVisibilidad((actual) => {
        const { [id]: _, ...resto } = actual;
        return resto;
      });
    }
  }

  if (productos.length === 0) {
    return <p className={styles.vacio}>No hay productos que coincidan con la búsqueda.</p>;
  }

  return (
    <>
      {error && <p className={styles.mensajeError}>{error}</p>}

      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>SKU</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Variantes</th>
              <th>Visible</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => {
              const productoVisible = visibilidadProductos[producto.id] ?? producto.activo;
              const tieneAgotada = producto.variantes.some((variante) => (visibilidadVariantes[variante.id] ?? variante.activo) && variante.cantidad === 0);
              const tieneStockBajo = producto.variantes.some((variante) => {
                const varianteVisible = visibilidadVariantes[variante.id] ?? variante.activo;
                return varianteVisible && variante.cantidad > 0 && variante.cantidad <= variante.stockMinimo;
              });
              const IconoStock = tieneAgotada ? IconoSinStock : tieneStockBajo ? IconoStockBajo : IconoDisponible;
              const claseEstadoStock = tieneAgotada ? styles.stockAgotado : tieneStockBajo ? styles.stockBajo : styles.stockDisponible;

              return <Fragment key={producto.id}>
              <tr className={producto.id === seleccionadoId ? styles.filaSeleccionada : undefined} onClick={() => onSeleccionar?.(producto.id)} style={onSeleccionar ? { cursor: "pointer" } : undefined}>
                <td>{producto.nombre}</td><td>{producto.sku}</td><td>{producto.precio}</td>
                <td>{producto.stock}</td>
                <td>
                  <span className={`${styles.stockEstado} ${claseEstadoStock}`} title={tieneAgotada ? "Agotado" : tieneStockBajo ? "Stock bajo" : "Disponible"} aria-label={tieneAgotada ? "Agotado" : tieneStockBajo ? "Stock bajo" : "Disponible"}>
                    <IconoStock aria-hidden="true" />
                  </span>
                </td>
                <td>{producto.variantes.length}</td>
                <td><button type="button" className={`${styles.switch} ${productoVisible ? styles.switchActivo : ""}`} disabled={pendiente || Boolean(guardandoVisibilidad[producto.id])} role="switch" aria-checked={productoVisible} aria-label={`${productoVisible ? "Ocultar" : "Mostrar"} ${producto.nombre} en la tienda`} title={productoVisible ? "Ocultar en la tienda" : "Mostrar en la tienda"} onClick={(evento) => { evento.stopPropagation(); cambiarVisibilidadProducto(producto.id, !productoVisible, productoVisible); }}><span className={styles.switchPunto} aria-hidden="true" /></button></td>
                <td><div className={styles.acciones} onClick={(evento) => evento.stopPropagation()}>
                  <Link href={`/admin/productos/${producto.id}`} className={styles.botonIcono} title="Editar" aria-label={`Editar ${producto.nombre}`}><IconoEditar /></Link>
                  <button type="button" className={styles.botonIcono} disabled={pendiente} title="Duplicar" aria-label={`Duplicar ${producto.nombre}`} onClick={() => correr(() => duplicarProducto(producto.id))}><IconoClonar /></button>
                  <button type="button" className={styles.botonIcono} disabled={pendiente} title="Eliminar" aria-label={`Eliminar ${producto.nombre}`} onClick={() => onEliminar(producto)}><IconoEliminar /></button>
                </div></td>
              </tr>
              {producto.id === seleccionadoId && <tr className={styles.filaVariantes}>
                <td colSpan={8}>
                  <table className={styles.tablaVariantesProducto}>
                    <thead><tr><th>Variante</th><th>SKU</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Visible</th></tr></thead>
                    <tbody>{producto.variantes.map((variante) => {
                      const varianteVisible = visibilidadVariantes[variante.id] ?? variante.activo;
                      const agotada = varianteVisible && variante.cantidad === 0;
                      const bajo = varianteVisible && variante.cantidad > 0 && variante.cantidad <= variante.stockMinimo;
                      const IconoVariante = agotada ? IconoSinStock : bajo ? IconoStockBajo : IconoDisponible;
                      const claseEstadoVariante = agotada ? styles.stockAgotado : bajo ? styles.stockBajo : styles.stockDisponible;
                      return <tr key={variante.id}><td>{variante.opciones}</td><td>{variante.sku}</td><td>{variante.precio}</td><td>{variante.cantidad}</td><td><span className={`${styles.stockEstado} ${claseEstadoVariante}`} title={agotada ? "Agotado" : bajo ? "Stock bajo" : "Disponible"} aria-label={agotada ? "Agotado" : bajo ? "Stock bajo" : "Disponible"}><IconoVariante aria-hidden="true" /></span></td><td><button type="button" className={`${styles.switch} ${varianteVisible ? styles.switchActivo : ""}`} disabled={pendiente || Boolean(guardandoVisibilidad[variante.id])} role="switch" aria-checked={varianteVisible} aria-label={`${varianteVisible ? "Ocultar" : "Mostrar"} la variante ${variante.opciones} en la tienda`} title={varianteVisible ? "Ocultar en la tienda" : "Mostrar en la tienda"} onClick={(evento) => { evento.stopPropagation(); cambiarVisibilidadVariante(variante.id, !varianteVisible, varianteVisible); }}><span className={styles.switchPunto} aria-hidden="true" /></button></td></tr>;
                    })}</tbody>
                  </table>
                </td>
              </tr>}
            </Fragment>;
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
