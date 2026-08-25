import Image from "next/image";
import Link from "next/link";
import { formatearPrecio } from "@/lib/utils";
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
  variantes?: { id: string; sku: string; talla: string; color: string; precio: unknown }[];
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
    imagenes: producto.imagenes.map((img) => ({ url: img.url })),
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
  }));
}

export function ProductoCard({ producto }: { producto: ProductoCardData }) {
  const imagen = producto.imagenes[0]?.url;
  const tieneOferta =
    producto.precioOferta != null && Number(producto.precioOferta) < Number(producto.precio);
  const variantePrincipal = producto.variantePrincipal ?? null;

  return (
    <Link href={`/productos/${producto.slug}${producto.varianteId ? `?variante=${producto.varianteId}` : ""}`} className={styles.tarjeta}>
      <div className={styles.imagenContenedor}>
        {imagen ? (
          <Image
            src={imagen}
            alt={producto.nombre}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={styles.imagen}
          />
        ) : (
          <div className={styles.imagenPlaceholder}>Sin imagen</div>
        )}
      </div>
      <div className={styles.info}>
        {producto.marca ? <p className={styles.marca}>{producto.marca.nombre}</p> : null}
        <h3 className={styles.nombre}>{producto.nombre}</h3>
        <p className={styles.sku}>SKU: {variantePrincipal?.sku ?? producto.sku}</p>
        {(producto.opciones ?? variantePrincipal?.talla) ? (
          <p className={styles.tallas}>Talla: {producto.opciones ?? variantePrincipal?.talla}</p>
        ) : null}
        <div className={styles.precios}>
          {tieneOferta ? (
            <>
              <span className={`${styles.precio} ${styles.precioOferta}`}>
                {formatearPrecio(producto.precioOferta as string)}
              </span>
              <span className={styles.precioTachado}>{formatearPrecio(producto.precio)}</span>
            </>
          ) : (
            <span className={styles.precio}>{formatearPrecio(producto.precio)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
