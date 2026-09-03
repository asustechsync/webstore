import Image from "next/image";
import Link from "next/link";
import { calcularDescuento, formatearPrecio } from "@/lib/utils";
import styles from "./ProductoCard.module.css";

export type ProductoCardData = {
  slug: string;
  nombre: string;
  sku: string;
  varianteId?: string;
  opciones?: string;
  precio: string;
  precioOferta: string | null;
  marca: { nombre: string } | null;
  imagenes: { url: string }[];
  tallas: string[];
  variantePrincipal?: { sku: string; talla: string } | null;
};

type ProductoOrigen = {
  slug: string;
  nombre: string;
  sku: string;
  precio: unknown;
  precioOferta: unknown;
  marca?: { nombre: string } | null;
  imagenes: { url: string }[];
  variantes?: {
    id: string;
    sku: string;
    talla: string;
    color: string;
    precio: unknown;
    imagenUrl?: string | null;
  }[];
};

export function aProductoCardData(producto: ProductoOrigen): ProductoCardData {
  return {
    slug: producto.slug,
    nombre: producto.nombre,
    sku: producto.sku,
    variantePrincipal: producto.variantes?.[0] ?? null,
    precio: String(producto.precio),
    precioOferta: producto.precioOferta != null ? String(producto.precioOferta) : null,
    marca: producto.marca ? { nombre: producto.marca.nombre } : null,
    // La variante principal es la que se muestra en la tarjeta: si tiene
    // portada propia, esa manda sobre la del producto.
    imagenes: producto.variantes?.[0]?.imagenUrl
      ? [{ url: producto.variantes[0].imagenUrl }]
      : producto.imagenes.map((img) => ({ url: img.url })),
    tallas: Array.from(new Set((producto.variantes ?? []).map((v) => v.talla))),
  };
}

export function aProductosCardData(producto: ProductoOrigen): ProductoCardData[] {
  const base = {
    slug: producto.slug,
    nombre: producto.nombre,
    precio: String(producto.precio),
    precioOferta: producto.precioOferta != null ? String(producto.precioOferta) : null,
    marca: producto.marca ? { nombre: producto.marca.nombre } : null,
    imagenes: producto.imagenes.map((img) => ({ url: img.url })),
    tallas: [],
  };

  if (!producto.variantes?.length) return [{ ...base, sku: producto.sku }];

  return producto.variantes.map((variante) => ({
    ...base,
    sku: variante.sku,
    varianteId: variante.id,
    opciones: [variante.talla, variante.color].filter(Boolean).join(" / "),
    precio: variante.precio != null ? String(variante.precio) : base.precio,
    // Sin foto propia la variante hereda la portada del producto; con ella,
    // cada color se ve como es en vez de repetir la misma imagen.
    imagenes: variante.imagenUrl ? [{ url: variante.imagenUrl }] : base.imagenes,
  }));
}

export function ProductoCard({
  producto,
  etiqueta,
  prioridad = false,
  variante = "tarjeta",
}: {
  producto: ProductoCardData;
  /** Distintivo opcional sobre la imagen, por ejemplo en "Nuevos ingresos". */
  etiqueta?: "nuevo";
  /** Adelanta la carga de la imagen en las tarjetas visibles al abrir la página. */
  prioridad?: boolean;
  /**
   * "tarjeta" encierra el producto en una caja (listados). "limpia" deja solo
   * la imagen y el texto, que es la lectura minimalista de la portada.
   */
  variante?: "tarjeta" | "limpia";
}) {
  const imagen = producto.imagenes[0]?.url;
  const descuento = calcularDescuento(producto.precio, producto.precioOferta);
  const variantePrincipal = producto.variantePrincipal ?? null;
  const opciones = producto.opciones ?? variantePrincipal?.talla ?? null;
  const sku = variantePrincipal?.sku ?? producto.sku;

  return (
    <Link
      href={`/productos/${producto.slug}${producto.varianteId ? `?variante=${producto.varianteId}` : ""}`}
      className={`${styles.tarjeta} ${variante === "limpia" ? styles.limpia : ""}`}
    >
      <div className={styles.imagenContenedor}>
        {imagen ? (
          <Image
            src={imagen}
            alt={producto.nombre}
            fill
            sizes="(min-width: 80rem) 16vw, (min-width: 48rem) 25vw, 50vw"
            className={styles.imagen}
            priority={prioridad}
          />
        ) : (
          <div className={styles.imagenPlaceholder}>Sin imagen</div>
        )}

        <div className={styles.etiquetas}>
          {descuento != null ? <span className={styles.etiquetaOferta}>-{descuento}%</span> : null}
          {etiqueta === "nuevo" ? <span className={styles.etiquetaNuevo}>Nuevo</span> : null}
        </div>
      </div>

      <div className={styles.info}>
        {producto.marca ? <p className={styles.marca}>{producto.marca.nombre}</p> : null}
        <h3 className={styles.nombre}>{producto.nombre}</h3>
        <p className={styles.meta}>
          {sku}
          {opciones ? ` · ${opciones}` : ""}
        </p>
        <div className={styles.precios}>
          {descuento != null ? (
            <>
              <span className={styles.precioRebajado}>
                {formatearPrecio(producto.precioOferta as string)}
              </span>
              <span className={styles.precioAnterior}>{formatearPrecio(producto.precio)}</span>
            </>
          ) : (
            <span className={styles.precio}>{formatearPrecio(producto.precio)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
