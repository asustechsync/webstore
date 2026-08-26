import Link from "next/link";
import Image from "next/image";
import { listarCategorias } from "@/features/catalogo/queries/categorias";
import { listarProductos } from "@/features/catalogo/queries/productos";
import { Container } from "@/components/ui/Container";
import { ProductosDestacados } from "@/components/productos/ProductosDestacados";
import { aProductosCardData } from "@/components/productos/ProductoCard";
import styles from "./page.module.css";

export const revalidate = 300; // ISR: 5 minutos

export default async function HomePage() {
  const [{ productos }, categorias] = await Promise.all([
    listarProductos({ porPagina: 8 }),
    listarCategorias({ soloDestacadas: true }),
  ]);
  const productosCard = productos.flatMap(aProductosCardData);

  return (
    <main>
      <Container>
        <section className={styles.encabezado}>
          <h1>Webstore</h1>
          <p>Descubre nuestro catálogo.</p>
        </section>

        {categorias.length > 0 && (
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>Categorías destacadas</h2>
            <div className={styles.categoriasGrid}>
              {categorias.map((categoria) => (
                <Link key={categoria.id} href={`/categorias/${categoria.slug}`} className={styles.categoria}>
                  {categoria.imagenUrl && <Image src={categoria.imagenUrl} alt="" fill sizes="(max-width: 640px) 50vw, 240px" />}
                  <span>{categoria.nombre}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {productos.length > 0 ? (
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>Productos</h2>
            <ProductosDestacados productos={productosCard} />
          </section>
        ) : (
          <p>Todavía no hay productos disponibles.</p>
        )}
      </Container>
    </main>
  );
}
