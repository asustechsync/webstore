import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { MigasDePan } from "@/components/ui/MigasDePan";
import { Section } from "@/components/ui/Section";
import { CarruselProductos } from "@/components/productos/CarruselProductos";
import { DetallesProducto, type BloqueDetalle } from "@/components/productos/DetallesProducto";
import { GaleriaProducto } from "@/components/productos/GaleriaProducto";
import { PanelCompra } from "@/components/productos/PanelCompra";
import { aProductoCardData } from "@/components/productos/ProductoCard";
import { construirDetalle } from "@/features/catalogo/detalle";
import {
  listarProductos,
  obtenerProductoPorSlug,
} from "@/features/catalogo/queries/productos";
import { formatearPrecio } from "@/lib/utils";
import styles from "./page.module.css";

export const revalidate = 300; // ISR: 5 minutos

type Props = { params: Promise<{ slug: string }> };

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
  const precio = Number(producto.precio);
  const precioOferta = producto.precioOferta != null ? Number(producto.precioOferta) : null;
  const imagenPrincipal = producto.imagenes[0]?.url ?? null;

  // Productos de la misma categoría, sin repetir el que se está viendo.
  const { productos: relacionados } = await listarProductos({
    categoriaSlug: producto.categoria.slug,
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

        <MigasDePan
          migas={[
            { texto: "Inicio", href: "/" },
            { texto: "Productos", href: "/productos" },
            { texto: producto.categoria.nombre, href: `/categorias/${producto.categoria.slug}` },
            { texto: producto.nombre },
          ]}
        />

        <div className={styles.ficha}>
          <div className={styles.galeria}>
            <GaleriaProducto imagenes={producto.imagenes} nombre={producto.nombre} />
          </div>

          <div className={styles.compra}>
            <header className={styles.encabezado}>
              {producto.marca ? <p className={styles.marca}>{producto.marca.nombre}</p> : null}
              <h1 className={styles.titulo}>{producto.nombre}</h1>
              {producto.descripcionCorta ? (
                <p className={styles.bajada}>{producto.descripcionCorta}</p>
              ) : null}
            </header>

            <Suspense
              fallback={
                <p className={styles.precioEstatico}>
                  {formatearPrecio(precioOferta ?? precio)}
                </p>
              }
            >
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
              />
            </Suspense>

            <ul className={styles.garantias}>
              <li>Envío a todo el Perú con Shalom</li>
              <li>Pago seguro con Izipay</li>
              <li>Stock real por talla y color</li>
            </ul>
          </div>
        </div>

        <div className={styles.fichas}>
          <DetallesProducto bloques={construirBloques(producto)} />
        </div>

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
