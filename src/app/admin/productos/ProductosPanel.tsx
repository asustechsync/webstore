"use client";

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
  // Se conserva para que al hacer clic en una fila se expanda su detalle de
  // variantes dentro de la misma tabla; ya no alimenta ningún panel lateral.
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);

  return (
    <div className={styles.bloque}>
      <FiltrosProductos categorias={categorias} />
      <ProductosTabla
        productos={productos}
        seleccionadoId={seleccionadoId}
        onSeleccionar={(id) => setSeleccionadoId((actual) => (actual === id ? null : id))}
      />
    </div>
  );
}
