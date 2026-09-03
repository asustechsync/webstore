import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { CabeceraCatalogo } from "@/components/catalogo/CabeceraCatalogo";
import { FiltrosCatalogo } from "@/components/catalogo/FiltrosCatalogo";
import { Paginacion } from "@/components/catalogo/Paginacion";
import { ProductosGrid } from "@/components/productos/ProductosGrid";
import { aProductosCardData } from "@/components/productos/ProductoCard";
import { listarFacetas, listarProductos } from "@/features/catalogo/queries/productos";
import { obtenerCategoriaPorSlug } from "@/features/catalogo/queries/categorias";
import {
  contarFiltrosActivos,
  leerFiltros,
  type ParametrosBusqueda,
} from "@/features/catalogo/filtros";
import { describirCatalogo } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ParametrosBusqueda>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await obtenerCategoriaPorSlug(slug);
  if (!categoria) return {};

  return {
    title: categoria.tituloSeo ?? categoria.nombre,
    description: categoria.descripcionSeo ?? categoria.descripcion ?? undefined,
  };
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const [{ slug }, parametros] = await Promise.all([params, searchParams]);
  // La categoría la impone la ruta: el panel no la ofrece como filtro.
  const filtros = leerFiltros(parametros, { categoria: slug });
  const basePath = `/categorias/${slug}`;

  const [categoria, resultado, facetas] = await Promise.all([
    obtenerCategoriaPorSlug(slug),
    listarProductos(filtros),
    listarFacetas({ categoria: slug }),
  ]);
  if (!categoria) notFound();

  const productos = resultado.productos.flatMap(aProductosCardData);
  const hayFiltros = contarFiltrosActivos(filtros, { categoria: true }) > 0;

  return (
    <main>
      <Container>
        <CabeceraCatalogo
          titulo={categoria.nombre}
          descripcion={categoria.descripcion}
          conteo={describirCatalogo(resultado.total, productos.length)}
          imagenUrl={categoria.imagenUrl}
        />

        {/* Sin catálogo que acotar la barra no ofrece nada; se muestra igual
            si hay filtros puestos, porque es la forma de quitarlos. */}
        {(resultado.total > 0 || hayFiltros) && (
          <FiltrosCatalogo
            basePath={basePath}
            facetas={facetas}
            filtros={filtros}
            ocultar={["categoria"]}
          />
        )}

        {productos.length > 0 ? (
          <>
            <ProductosGrid productos={productos} />
            <Paginacion
              basePath={basePath}
              parametros={parametros}
              pagina={resultado.pagina}
              totalPaginas={resultado.totalPaginas}
            />
          </>
        ) : hayFiltros ? (
          <EstadoVacio
            titulo="Sin resultados"
            descripcion="Ningún producto de esta categoría coincide con los filtros elegidos."
            accion={{ href: basePath, texto: "Quitar filtros" }}
          />
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
