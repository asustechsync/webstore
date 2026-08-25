"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiltrosProductos } from "./FiltrosProductos";
import { ProductosTabla } from "./ProductosTabla";
import styles from "../admin.module.css";

type Categoria = { id: string; nombre: string };

export type ProductoDetalle = {
  id: string;
  nombre: string;
  sku: string;
  precio: string;
  activo: boolean;
  stock: number;
  stockBajo: boolean;
  imagenUrl?: string;
  categoria: string;
  marca: string;
  tallas: number;
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

export function ProductosPanel({
  productos,
  categorias,
}: {
  productos: ProductoDetalle[];
  categorias: Categoria[];
}) {
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const seleccionado = productos.find((producto) => producto.id === seleccionadoId) ?? null;

  return (
    <div className={`${styles.diseñoColumnas} ${styles.panelProductos}`}>
      <div className={styles.columna}>
        <div className={styles.bloque}>
          <FiltrosProductos categorias={categorias} />
          <ProductosTabla
            productos={productos}
            seleccionadoId={seleccionadoId}
            onSeleccionar={(id) => setSeleccionadoId((actual) => actual === id ? null : id)}
          />
        </div>
      </div>

      <div className={styles.columna}>
        <div className={styles.bloque}>
          <h2 className={styles.bloqueTitulo}>Vista previa</h2>
          {seleccionado ? (
            <div className={styles.previaProducto}>
              {seleccionado.imagenUrl ? (
                <Image
                  src={seleccionado.imagenUrl}
                  alt=""
                  width={240}
                  height={240}
                  className={styles.previaImagen}
                />
              ) : (
                <div className={styles.previaImagenVacia} aria-hidden />
              )}

              <div className={styles.previaNombre}>{seleccionado.nombre}</div>

              <dl className={styles.previaDatos}>
                <div>
                  <dt>SKU</dt>
                  <dd>{seleccionado.sku}</dd>
                </div>
                <div>
                  <dt>Precio</dt>
                  <dd>{seleccionado.precio}</dd>
                </div>
                <div>
                  <dt>Categoría</dt>
                  <dd>{seleccionado.categoria}</dd>
                </div>
                <div>
                  <dt>Marca</dt>
                  <dd>{seleccionado.marca}</dd>
                </div>
                <div>
                  <dt>Tallas</dt>
                  <dd>{seleccionado.tallas}</dd>
                </div>
                <div>
                  <dt>Stock</dt>
                  <dd className={seleccionado.stockBajo ? styles.alerta : undefined}>
                    {seleccionado.stock}
                  </dd>
                </div>
                <div>
                  <dt>Visible</dt>
                  <dd>{seleccionado.activo ? "Sí" : "No"}</dd>
                </div>
              </dl>

              <Link
                href={`/admin/productos/${seleccionado.id}`}
                className={styles.botonSecundario}
              >
                Editar producto
              </Link>
            </div>
          ) : (
            <p className={styles.bloqueAyuda}>
              Haz clic en un producto de la lista para ver su detalle acá.
            </p>
          )}
        </div>

        <div className={styles.bloque}>
          <h2 className={styles.bloqueTitulo}>Atajos</h2>
          <div className={styles.listaAtajos}>
            <Link href="/admin/categorias" className={styles.enlace}>
              Categorías
            </Link>
            <Link href="/admin/marcas" className={styles.enlace}>
              Marcas
            </Link>
            <Link href="/admin/stock" className={styles.enlace}>
              Stock
            </Link>
            <Link href="/admin/cupones" className={styles.enlace}>
              Cupones
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
