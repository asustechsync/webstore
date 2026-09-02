import type { Metadata } from "next";
import { listarProductos } from "@/features/catalogo/queries/productos";
import { Container } from "@/components/ui/Container";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductosGrid } from "@/components/productos/ProductosGrid";
import { aProductosCardData } from "@/components/productos/ProductoCard";
import { describirCatalogo } from "@/lib/utils";

export const revalidate = 300; // ISR: 5 minutos

export const metadata: Metadata = {
  title: "Productos",
  description: "Todo el catálogo de Webstore.",
};

export default async function ProductosPage() {
  const { productos, total } = await listarProductos();
  const productosCard = productos.flatMap(aProductosCardData);

  return (
    <main>
      <Container>
        <PageHeader
          titulo="Productos"
          descripcion={
            total > 0 ? describirCatalogo(total, productosCard.length) : undefined
          }
        />

        {productosCard.length > 0 ? (
          <ProductosGrid productos={productosCard} />
        ) : (
          <EstadoVacio
            titulo="Todavía no hay productos"
            descripcion="Estamos preparando el catálogo. Vuelve pronto."
            accion={{ href: "/categorias", texto: "Ver categorías" }}
          />
        )}
      </Container>
    </main>
  );
}
