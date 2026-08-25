import { listarProductos } from "@/features/catalogo/queries";
import { Container } from "@/components/ui/Container";
import { ProductosGrid } from "@/components/productos/ProductosGrid";
import { aProductosCardData } from "@/components/productos/ProductoCard";

export const revalidate = 300; // ISR: 5 minutos

export default async function ProductosPage() {
  const { productos } = await listarProductos();
  const productosCard = productos.flatMap(aProductosCardData);

  return (
    <main>
      <Container>
        <h1>Productos</h1>
        <ProductosGrid productos={productosCard} />
      </Container>
    </main>
  );
}
