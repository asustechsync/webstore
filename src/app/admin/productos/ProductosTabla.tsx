"use client";

import Link from "next/link";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  alternarActivoProducto,
  alternarActivoVariante,
  duplicarProducto,
  eliminarProducto,
} from "@/features/catalogo/actions";
import styles from "../admin.module.css";

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

              return <Fragment key={producto.id}>
              <tr className={producto.id === seleccionadoId ? styles.filaSeleccionada : undefined} onClick={() => onSeleccionar?.(producto.id)} style={onSeleccionar ? { cursor: "pointer" } : undefined}>
                <td>{producto.nombre}</td><td>{producto.sku}</td><td>{producto.precio}</td>
                <td className={tieneAgotada ? styles.alerta : tieneStockBajo ? styles.stockBajoTexto : undefined}>{producto.stock}</td>
                <td>{producto.variantes.length}</td>
                <td><input type="checkbox" checked={productoVisible} disabled={pendiente || Boolean(guardandoVisibilidad[producto.id])} aria-label={`Mostrar ${producto.nombre} en la tienda`} onClick={(evento) => evento.stopPropagation()} onChange={(evento) => cambiarVisibilidadProducto(producto.id, evento.target.checked, productoVisible)} /></td>
                <td><div className={styles.acciones} onClick={(evento) => evento.stopPropagation()}>
                  <Link href={`/admin/productos/${producto.id}`} className={styles.botonIcono} title="Editar" aria-label={`Editar ${producto.nombre}`}><Pencil size={14} /></Link>
                  <button type="button" className={styles.botonIcono} disabled={pendiente} title="Duplicar" aria-label={`Duplicar ${producto.nombre}`} onClick={() => correr(() => duplicarProducto(producto.id))}><Copy size={14} /></button>
                  <button type="button" className={styles.botonIconoPeligro} disabled={pendiente} title="Eliminar" aria-label={`Eliminar ${producto.nombre}`} onClick={() => onEliminar(producto)}><Trash2 size={14} /></button>
                </div></td>
              </tr>
              {producto.id === seleccionadoId && <tr className={styles.filaVariantes}>
                <td colSpan={7}>
                  <table className={styles.tablaVariantesProducto}>
                    <thead><tr><th>Variante</th><th>SKU</th><th>Precio</th><th>Stock</th><th>Visible</th></tr></thead>
                    <tbody>{producto.variantes.map((variante) => {
                      const varianteVisible = visibilidadVariantes[variante.id] ?? variante.activo;
                      const agotada = varianteVisible && variante.cantidad === 0;
                      const bajo = varianteVisible && variante.cantidad > 0 && variante.cantidad <= variante.stockMinimo;
                      const claseStock = agotada ? styles.alerta : bajo ? styles.stockBajoTexto : undefined;
                      return <tr key={variante.id}><td>{variante.opciones}</td><td>{variante.sku}</td><td>{variante.precio}</td><td className={claseStock}>{variante.cantidad}</td><td><input type="checkbox" checked={varianteVisible} disabled={pendiente || Boolean(guardandoVisibilidad[variante.id])} aria-label={`Mostrar la variante ${variante.opciones} en la tienda`} onChange={(evento) => cambiarVisibilidadVariante(variante.id, evento.target.checked, varianteVisible)} /></td></tr>;
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
