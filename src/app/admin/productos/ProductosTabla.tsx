"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
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
  categoria: string;
  marca: string;
  activo: boolean;
  tallas: number;
  stock: number;
  stockBajo: boolean;
};

export function ProductosTabla({ productos }: { productos: Fila[] }) {
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
              <th>Categoría</th>
              <th>Marca</th>
              <th>Tallas</th>
              <th>Stock</th>
              <th>Visible</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{producto.sku}</td>
                <td>{producto.precio}</td>
                <td>{producto.categoria}</td>
                <td>{producto.marca}</td>
                <td>{producto.tallas}</td>
                <td className={producto.stockBajo ? styles.alerta : undefined}>
                  {producto.stock}
                  {producto.stockBajo && " ⚠"}
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={producto.activo}
                    disabled={pendiente}
                    aria-label={`Mostrar ${producto.nombre} en la tienda`}
                    onChange={(evento) =>
                      correr(() => alternarActivoProducto(producto.id, evento.target.checked))
                    }
                  />
                </td>
                <td>
                  <div className={styles.acciones}>
                    <Link href={`/admin/productos/${producto.id}`} className={styles.botonChico}>
                      Editar
                    </Link>
                    <button
                      type="button"
                      className={styles.botonChico}
                      disabled={pendiente}
                      onClick={() => correr(() => duplicarProducto(producto.id))}
                    >
                      Duplicar
                    </button>
                    <button
                      type="button"
                      className={styles.botonPeligro}
                      disabled={pendiente}
                      onClick={() => onEliminar(producto)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
