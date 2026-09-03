import { COLORES_POR_NOMBRE } from "./opciones";
import { slugificar } from "@/lib/utils";
import type { obtenerProductoPorSlug } from "./queries/productos";

type ProductoDetalle = NonNullable<Awaited<ReturnType<typeof obtenerProductoPorSlug>>>;

export type ValorVista = { id: string; valor: string; hex: string | null };

export type OpcionVista = {
  clave: string;
  nombre: string;
  esColor: boolean;
  valores: ValorVista[];
};

export type VarianteVista = {
  id: string;
  sku: string;
  /** "M / Negro"; es lo que se guarda en el carrito y se muestra al elegir. */
  etiqueta: string;
  talla: string;
  color: string;
  precio: number;
  precioOferta: number | null;
  cantidad: number;
  stockMinimo: number;
  /** Portada propia de la variante; null = se usa la galería del producto. */
  imagenUrl: string | null;
  /** Ids de los valores de opción que identifican esta combinación. */
  valores: string[];
};

export type DetalleVista = {
  opciones: OpcionVista[];
  variantes: VarianteVista[];
};

function hexDeColor(valor: string) {
  return COLORES_POR_NOMBRE[slugificar(valor)] ?? null;
}

/**
 * Traduce el producto de la base a lo que necesita el selector de compra.
 *
 * Cubre los dos modelos que conviven en el catálogo: productos con opciones
 * declaradas (talla, color, contorno...) y productos antiguos que solo tienen
 * variantes con talla y color sueltos. En ambos casos devuelve la misma forma,
 * ya serializable, para que el componente cliente no distinga entre ellos.
 */
export function construirDetalle(producto: ProductoDetalle): DetalleVista {
  const precioBase = Number(producto.precio);
  const precioOferta = producto.precioOferta != null ? Number(producto.precioOferta) : null;

  const comun = (variante: ProductoDetalle["variantes"][number]) => ({
    id: variante.id,
    sku: variante.sku,
    etiqueta: [variante.talla, variante.color].filter(Boolean).join(" / ") || "Única",
    talla: variante.talla,
    color: variante.color,
    precio: variante.precio != null ? Number(variante.precio) : precioBase,
    precioOferta,
    cantidad: variante.cantidad,
    stockMinimo: variante.stockMinimo,
    imagenUrl: variante.imagenUrl,
  });

  if (producto.opciones.length > 0) {
    const variantes = producto.variantes.map((variante) => ({
      ...comun(variante),
      valores: variante.valores.map((relacion) => relacion.valorId),
    }));

    const opciones = producto.opciones
      .map((opcion) => ({
        clave: opcion.clave,
        nombre: opcion.nombre,
        esColor: opcion.clave === "color",
        valores: opcion.valores
          // Un valor sin ninguna variante activa no se puede comprar.
          .filter((valor) => variantes.some((v) => v.valores.includes(valor.id)))
          .map((valor) => ({
            id: valor.id,
            valor: valor.valor,
            hex: opcion.clave === "color" ? hexDeColor(valor.valor) : null,
          })),
      }))
      .filter((opcion) => opcion.valores.length > 0);

    return { opciones, variantes };
  }

  // Sin opciones declaradas: se derivan de la talla y el color de cada
  // variante, usando el propio texto como identificador.
  const idValor = (clave: string, valor: string) => `${clave}:${valor}`;

  const variantes = producto.variantes.map((variante) => ({
    ...comun(variante),
    valores: [
      variante.talla ? idValor("talla", variante.talla) : null,
      variante.color ? idValor("color", variante.color) : null,
    ].filter((valor): valor is string => valor !== null),
  }));

  const derivarOpcion = (clave: string, nombre: string, valores: string[]): OpcionVista | null => {
    const unicos = [...new Set(valores.filter(Boolean))];
    if (unicos.length === 0) return null;
    return {
      clave,
      nombre,
      esColor: clave === "color",
      valores: unicos.map((valor) => ({
        id: idValor(clave, valor),
        valor,
        hex: clave === "color" ? hexDeColor(valor) : null,
      })),
    };
  };

  const opciones = [
    derivarOpcion("talla", "Talla", producto.variantes.map((v) => v.talla)),
    derivarOpcion("color", "Color", producto.variantes.map((v) => v.color)),
  ].filter((opcion): opcion is OpcionVista => opcion !== null);

  return { opciones, variantes };
}
