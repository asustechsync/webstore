import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { ProductosGrid } from "@/components/productos/ProductosGrid";
import { aProductosCardData } from "@/components/productos/ProductoCard";
import { listarProductos } from "@/features/catalogo/queries/productos";
import { obtenerCategoriaPorSlug } from "@/features/catalogo/queries/categorias";
import { describirCatalogo } from "@/lib/utils";
import styles from "../page.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await obtenerCategoriaPorSlug(slug);
  if (!categoria) return {};

  return {
    title: categoria.tituloSeo ?? categoria.nombre,
    description: categoria.descripcionSeo ?? categoria.descripcion ?? undefined,
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params;
  const [categoria, resultado] = await Promise.all([
    obtenerCategoriaPorSlug(slug),
    listarProductos({ categoriaSlug: slug }),
  ]);
  if (!categoria) notFound();
  const productos = resultado.productos.flatMap(aProductosCardData);

  return (
    <main>
      <Container>
        <section className={styles.encabezadoCategoria}>
          {categoria.imagenUrl && (
            <Image
              src={categoria.imagenUrl}
              alt=""
              className={styles.imagenCabecera}
              width={224}
              height={224}
              sizes="(min-width: 40rem) 112px, 72px"
            />
          )}
          <div>
            <h1>{categoria.nombre}</h1>
            {categoria.descripcion && <p>{categoria.descripcion}</p>}
            <span className={styles.conteo}>
              {describirCatalogo(resultado.total, productos.length)}
            </span>
          </div>
        </section>

        {productos.length > 0 ? (
          <ProductosGrid productos={productos} />
        ) : (
          <EstadoVacio
            titulo="Sin productos por ahora"
            descripcion="Esta categoría todavía no tiene productos publicados."
            accion={{ href: "/productos", texto: "Ver todo el catálogo" }}
          />
        )}
      </Container>
    </main>
  );
}
