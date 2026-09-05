import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { MigasDePan } from "@/components/ui/MigasDePan";
import { Section } from "@/components/ui/Section";
import { CarruselProductos } from "@/components/productos/CarruselProductos";
import { DetallesProducto, type BloqueDetalle } from "@/components/productos/DetallesProducto";
import { GaleriaProducto } from "@/components/productos/GaleriaProducto";
import { ProveedorVariante } from "@/components/productos/ContextoVariante";
import { PanelCompra } from "@/components/productos/PanelCompra";
import { aProductoCardData } from "@/components/productos/ProductoCard";
import { construirDetalle } from "@/features/catalogo/detalle";
import {
  listarProductos,
  listarSlugsPublicados,
  obtenerProductoPorSlug,
} from "@/features/catalogo/queries/productos";
import styles from "./page.module.css";

/*
 * Ficha pre-construida. Cada producto publicado se genera como HTML en el
 * build y se sirve sin tocar la base, que es lo que la lleva de ~220 ms a la
 * decena de milisegundos.
 *
 * Para lograrlo la página no lee `searchParams`: el `?variante=` lo resuelve
 * `ProveedorVariante` en el navegador. Leerlo acá volvería la ruta dinámica y
 * no habría nada que pre-construir.
 *
 * El stock y el precio quedan congelados en el HTML hasta la siguiente
 * regeneración, así que las dos cosas que los cambian —una compra y un ajuste
 * del panel— llaman a `revalidatePath` de esta ruta. El plazo de caducidad lo
 * fija `cacheLife` en las consultas del catálogo, como red de seguridad por si
 * algo se tocara directo en la base.
 */
/**
 * Productos que se pre-construyen. Los que no estén en la lista (uno recién
 * publicado, por ejemplo) se renderizan igual la primera vez que alguien los
 * abre y quedan cacheados desde ahí.
 */
export async function generateStaticParams() {
  return listarSlugsPublicados();
}

// Pre-construida al build y servida desde caché (ver el comentario de arriba);
// `instant = true` la deja validada aunque el resto del sitio ya no se valide
// por defecto (ver next.config.ts).
export const instant = true;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await obtenerProductoPorSlug(slug);
  if (!producto) return {};

  const descripcion =
    producto.descripcionSeo ?? producto.descripcionCorta ?? producto.descripcion.slice(0, 160);

  return {
    title: producto.tituloSeo ?? producto.nombre,
    description: descripcion,
    openGraph: {
      title: producto.tituloSeo ?? producto.nombre,
      description: descripcion,
      type: "website",
      images: producto.imagenes[0] ? [{ url: producto.imagenes[0].url }] : undefined,
    },
  };
}

/** Fichas de texto que existan en el producto; las vacías no se muestran. */
function construirBloques(producto: {
  descripcion: string;
  material: string | null;
  cuidados: string | null;
  guiaTallas: string | null;
}): BloqueDetalle[] {
  return [
    { titulo: "Descripción", contenido: producto.descripcion },
    { titulo: "Material", contenido: producto.material ?? "" },
    { titulo: "Cuidados", contenido: producto.cuidados ?? "" },
    { titulo: "Guía de tallas", contenido: producto.guiaTallas ?? "" },
  ].filter((bloque) => bloque.contenido.trim().length > 0);
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const producto = await obtenerProductoPorSlug(slug);
  if (!producto) notFound();

  const detalle = construirDetalle(producto);
  const bloques = construirBloques(producto);
  const precio = Number(producto.precio);
  const precioOferta = producto.precioOferta != null ? Number(producto.precioOferta) : null;
  const imagenPrincipal = producto.imagenes[0]?.url ?? null;

  // Productos de la misma categoría, sin repetir el que se está viendo.
  const { productos: relacionados } = await listarProductos({
    categoria: producto.categoria.slug,
    porPagina: 9,
  });
  const relacionadosCard = relacionados
    .filter((otro) => otro.id !== producto.id)
    .slice(0, 8)
    .map(aProductoCardData);

  const hayStock = detalle.variantes.some((variante) => variante.cantidad > 0);

  // Datos estructurados: es lo que leen los buscadores, así que el precio y la
  // disponibilidad van acá aunque el panel de compra sea interactivo.
  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcionCorta ?? producto.descripcion,
    sku: producto.sku,
    image: producto.imagenes.map((imagen) => imagen.url),
    ...(producto.marca ? { brand: { "@type": "Brand", name: producto.marca.nombre } } : {}),
    offers: {
      "@type": "Offer",
      price: (precioOferta ?? precio).toFixed(2),
      priceCurrency: "PEN",
      availability: hayStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main>
      <Container>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
        />

        {/* Igual que en la referencia: la ruta a la izquierda y el atajo a
            todo el catálogo de la marca a la derecha. */}
        <div className={styles.cabecera}>
          <MigasDePan
            migas={[
              { texto: "Inicio", href: "/" },
              { texto: "Productos", href: "/productos" },
              { texto: producto.categoria.nombre, href: `/categorias/${producto.categoria.slug}` },
              { texto: producto.nombre },
            ]}
          />
          {producto.marca ? (
            <Link href={`/marcas/${producto.marca.slug}`} className={styles.enlaceMarca}>
              Ver todo de {producto.marca.nombre}
            </Link>
          ) : null}
        </div>

        {/* El proveedor envuelve las dos columnas porque la galería y la caja
            de compra comparten la variante elegida. */}
        <ProveedorVariante detalle={detalle}>
          <div className={styles.ficha}>
            <div className={styles.galeria}>
              <GaleriaProducto imagenes={producto.imagenes} nombre={producto.nombre} />
            </div>

            <PanelCompra
              producto={{
                id: producto.id,
                nombre: producto.nombre,
                slug: producto.slug,
                precio,
                precioOferta,
                imagenUrl: imagenPrincipal,
              }}
              detalle={detalle}
            >
              <header className={styles.encabezado}>
                {producto.marca ? <p className={styles.marca}>{producto.marca.nombre}</p> : null}
                <h1 className={styles.titulo}>{producto.nombre}</h1>

                <p className={styles.identificadores}>
                  {producto.skuInterno ? <span>Modelo: {producto.skuInterno}</span> : null}
                  <span>SKU: {producto.sku}</span>
                  <span>
                    Categoría:{" "}
                    <Link href={`/categorias/${producto.categoria.slug}`}>
                      {producto.categoria.nombre}
                    </Link>
                  </span>
                </p>

                {producto.descripcionCorta ? (
                  <p className={styles.bajada}>{producto.descripcionCorta}</p>
                ) : null}

                {bloques.length > 0 ? (
                  <a href="#detalles" className={styles.verDetalles}>
                    Ver ficha completa
                  </a>
                ) : null}
              </header>
            </PanelCompra>
          </div>
        </ProveedorVariante>

        {bloques.length > 0 ? (
          <div id="detalles" className={styles.fichas}>
            <DetallesProducto bloques={bloques} />
          </div>
        ) : null}

        {relacionadosCard.length > 0 ? (
          <Section
            titulo="También te puede interesar"
            descripcion={`Más de ${producto.categoria.nombre}`}
            enlace={`/categorias/${producto.categoria.slug}`}
          >
            <CarruselProductos
              productos={relacionadosCard}
              titulo="Productos relacionados"
              variante="limpia"
            />
          </Section>
        ) : null}
      </Container>
    </main>
  );
}
