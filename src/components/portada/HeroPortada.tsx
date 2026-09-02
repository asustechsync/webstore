import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/LinkButton";
import { formatearPrecio } from "@/lib/utils";
import styles from "./HeroPortada.module.css";

export type PiezaCategoria = {
  nombre: string;
  slug: string;
  imagenUrl: string | null;
  totalProductos: number;
};

export type PiezaProducto = {
  nombre: string;
  slug: string;
  imagenUrl: string | null;
  precio: string;
  precioOferta: string | null;
  descuento: number | null;
  marca: string | null;
};

/**
 * Bloque de entrada de la portada, en rejilla asimétrica: el mensaje ocupa la
 * columna ancha y dos piezas navegables completan el alto. Con menos datos
 * (sin categorías o sin productos) las piezas desaparecen y el mensaje pasa a
 * ocupar todo el ancho, sin dejar huecos.
 */
export function HeroPortada({
  totalProductos,
  totalCategorias,
  categoria,
  producto,
}: {
  totalProductos: number;
  totalCategorias: number;
  categoria: PiezaCategoria | null;
  producto: PiezaProducto | null;
}) {
  const enOferta = producto?.descuento != null;

  return (
    <section className={styles.hero}>
      <div className={styles.principal}>
        <p className={styles.etiqueta}>Tienda online</p>
        <h1 className={styles.titulo}>Ropa interior y básicos para toda la familia.</h1>
        <p className={styles.texto}>
          Medias, boxers y brasieres elegidos por talla y color, con stock real y envío a
          todo el Perú.
        </p>

        <div className={styles.acciones}>
          <LinkButton href="/productos" anchoCompleto={false}>
            Ver catálogo
          </LinkButton>
          <LinkButton href="/categorias" variante="secundario" anchoCompleto={false}>
            Explorar categorías
          </LinkButton>
        </div>

        <dl className={styles.datos}>
          <div className={styles.dato}>
            <dt>Productos</dt>
            <dd>{totalProductos}</dd>
          </div>
          <div className={styles.dato}>
            <dt>Categorías</dt>
            <dd>{totalCategorias}</dd>
          </div>
          <div className={styles.dato}>
            <dt>Envío</dt>
            <dd>Todo el Perú</dd>
          </div>
        </dl>
      </div>

      {categoria ? (
        <Link href={`/categorias/${categoria.slug}`} className={styles.pieza}>
          <div className={styles.piezaImagen}>
            {categoria.imagenUrl ? (
              <Image
                src={categoria.imagenUrl}
                alt=""
                fill
                sizes="(min-width: 64rem) 34vw, 50vw"
                className={styles.imagen}
              />
            ) : null}
          </div>
          <div className={styles.piezaTexto}>
            <p className={styles.piezaEtiqueta}>Categoría</p>
            <p className={styles.piezaTitulo}>{categoria.nombre}</p>
            <p className={styles.piezaPie}>
              {categoria.totalProductos} producto{categoria.totalProductos === 1 ? "" : "s"}
            </p>
          </div>
        </Link>
      ) : null}

      {producto ? (
        <Link href={`/productos/${producto.slug}`} className={styles.pieza}>
          <div className={styles.piezaImagen}>
            {producto.imagenUrl ? (
              <Image
                src={producto.imagenUrl}
                alt=""
                fill
                sizes="(min-width: 64rem) 34vw, 50vw"
                className={styles.imagen}
              />
            ) : null}
          </div>
          <div className={styles.piezaTexto}>
            <p className={styles.piezaEtiqueta}>
              {enOferta ? `Oferta · -${producto.descuento}%` : "Último ingreso"}
            </p>
            <p className={styles.piezaTitulo}>{producto.nombre}</p>
            <p className={styles.piezaPie}>
              {formatearPrecio(enOferta ? (producto.precioOferta as string) : producto.precio)}
            </p>
          </div>
        </Link>
      ) : null}
    </section>
  );
}
