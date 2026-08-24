"use client";

import Link from "next/link";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  alternarActivoProducto,
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
              <th>Visible</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => <Fragment key={producto.id}>
              <tr className={producto.id === seleccionadoId ? styles.filaSeleccionada : undefined} onClick={() => onSeleccionar?.(producto.id)} style={onSeleccionar ? { cursor: "pointer" } : undefined}>
                <td>{producto.nombre}</td><td>{producto.sku}</td><td>{producto.precio}</td>
                <td className={producto.stockBajo ? styles.alerta : undefined}>{producto.stock}{producto.stockBajo && " ⚠"}</td>
                <td><input type="checkbox" checked={producto.activo} disabled={pendiente} aria-label={`Mostrar ${producto.nombre} en la tienda`} onClick={(evento) => evento.stopPropagation()} onChange={(evento) => correr(() => alternarActivoProducto(producto.id, evento.target.checked))} /></td>
                <td><div className={styles.acciones} onClick={(evento) => evento.stopPropagation()}>
                  <Link href={`/admin/productos/${producto.id}`} className={styles.botonIcono} title="Editar" aria-label={`Editar ${producto.nombre}`}><Pencil size={14} /></Link>
                  <button type="button" className={styles.botonIcono} disabled={pendiente} title="Duplicar" aria-label={`Duplicar ${producto.nombre}`} onClick={() => correr(() => duplicarProducto(producto.id))}><Copy size={14} /></button>
                  <button type="button" className={styles.botonIconoPeligro} disabled={pendiente} title="Eliminar" aria-label={`Eliminar ${producto.nombre}`} onClick={() => onEliminar(producto)}><Trash2 size={14} /></button>
                </div></td>
              </tr>
              {producto.id === seleccionadoId && <tr className={styles.filaVariantes}>
                <td colSpan={6}>
                  <table className={styles.tablaVariantesProducto}>
                    <thead><tr><th>Variante</th><th>SKU</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr></thead>
                    <tbody>{producto.variantes.map((variante) => {
                      const bajo = variante.activo && variante.cantidad <= variante.stockMinimo;
                      const estado = !variante.activo ? "Inactiva" : variante.cantidad === 0 ? "Agotada" : bajo ? "Stock bajo" : "Disponible";
                      return <tr key={variante.id}><td>{variante.opciones}</td><td>{variante.sku}</td><td className={bajo ? styles.alerta : undefined}>{variante.cantidad}</td><td>{variante.stockMinimo}</td><td className={bajo ? styles.alerta : undefined}>{estado}</td></tr>;
                    })}</tbody>
                  </table>
                </td>
              </tr>}
            </Fragment>)}
          </tbody>
        </table>
      </div>
    </>
  );
}
