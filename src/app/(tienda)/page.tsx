import { listarProductos } from "@/features/catalogo/queries";
import { Container } from "@/components/ui/Container";
import { ProductosDestacados } from "@/components/productos/ProductosDestacados";
import { aProductosCardData } from "@/components/productos/ProductoCard";
import styles from "./page.module.css";

export const revalidate = 300; // ISR: 5 minutos

export default async function HomePage() {
  const { productos } = await listarProductos({ porPagina: 8 });
  const productosCard = productos.flatMap(aProductosCardData);

  return (
    <main>
      <Container>
        <section className={styles.encabezado}>
          <h1>Webstore</h1>
          <p>Descubre nuestro catálogo.</p>
        </section>

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
