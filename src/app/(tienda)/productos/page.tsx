import type { Metadata } from "next";
import { listarFacetas, listarProductos } from "@/features/catalogo/queries/productos";
import {
  contarFiltrosActivos,
  leerFiltros,
  type ParametrosBusqueda,
} from "@/features/catalogo/filtros";
import { Container } from "@/components/ui/Container";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { PageHeader } from "@/components/ui/PageHeader";
import { FiltrosCatalogo } from "@/components/catalogo/FiltrosCatalogo";
import { Paginacion } from "@/components/catalogo/Paginacion";
import { ProductosGrid } from "@/components/productos/ProductosGrid";
import { aProductosCardData } from "@/components/productos/ProductoCard";
import { describirCatalogo } from "@/lib/utils";

// Los filtros viven en la URL, así que la página se renderiza por petición.
// El catálogo sin filtrar tampoco se cachea acá: leer searchParams ya la
// convierte en dinámica.

export const metadata: Metadata = {
  title: "Productos",
  description: "Todo el catálogo de Webstore.",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}) {
  const parametros = await searchParams;
  const filtros = leerFiltros(parametros);

  const [resultado, facetas] = await Promise.all([listarProductos(filtros), listarFacetas()]);
  const productosCard = resultado.productos.flatMap(aProductosCardData);
  const hayFiltros = contarFiltrosActivos(filtros) > 0;

  return (
    <main>
      <Container>
        <PageHeader
          titulo="Productos"
          descripcion={
            resultado.total > 0
              ? describirCatalogo(resultado.total, productosCard.length)
              : undefined
          }
        />

        {/* Sin catálogo que acotar la barra no ofrece nada; se muestra igual
            si hay filtros puestos, porque es la forma de quitarlos. */}
        {(resultado.total > 0 || hayFiltros) && (
          <FiltrosCatalogo basePath="/productos" facetas={facetas} filtros={filtros} />
        )}

        {productosCard.length > 0 ? (
          <>
            <ProductosGrid productos={productosCard} />
            <Paginacion
              basePath="/productos"
              parametros={parametros}
              pagina={resultado.pagina}
              totalPaginas={resultado.totalPaginas}
            />
          </>
        ) : hayFiltros ? (
          <EstadoVacio
            titulo="Sin resultados"
            descripcion="Ningún producto coincide con los filtros elegidos."
            accion={{ href: "/productos", texto: "Quitar filtros" }}
          />
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
