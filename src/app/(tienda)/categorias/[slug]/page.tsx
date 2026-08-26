import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ProductosGrid } from "@/components/productos/ProductosGrid";
import { aProductosCardData } from "@/components/productos/ProductoCard";
import { listarProductos, obtenerCategoriaPorSlug } from "@/features/catalogo/queries";
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

export default async function CategoriaPage({
  params,
}: Props) {
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
          {categoria.imagenUrl && <img src={categoria.imagenUrl} alt="" className={styles.imagenCabecera} />}
          <div>
            <h1>{categoria.nombre}</h1>
            {categoria.descripcion && <p>{categoria.descripcion}</p>}
          </div>
        </section>
        {productos.length > 0 ? <ProductosGrid productos={productos} /> : <p className={styles.vacio}>No hay productos disponibles en esta categoría.</p>}
      </Container>
    </main>
  );
}
