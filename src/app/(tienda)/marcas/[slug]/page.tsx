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
import { obtenerMarcaPorSlug } from "@/features/catalogo/queries/marcas";
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
  const marca = await obtenerMarcaPorSlug(slug);
  if (!marca) return {};

  return {
    title: marca.nombre,
    description: `Productos de ${marca.nombre} en Webstore.`,
  };
}

export default async function MarcaPage({ params, searchParams }: Props) {
  const [{ slug }, parametros] = await Promise.all([params, searchParams]);
  // La marca la impone la ruta: el panel no la ofrece como filtro.
  const filtros = leerFiltros(parametros, { marca: slug });
  const basePath = `/marcas/${slug}`;

  const [marca, resultado, facetas] = await Promise.all([
    obtenerMarcaPorSlug(slug),
    listarProductos(filtros),
    listarFacetas({ marca: slug }),
  ]);
  if (!marca) notFound();

  const productos = resultado.productos.flatMap(aProductosCardData);
  const hayFiltros = contarFiltrosActivos(filtros, { marca: true }) > 0;

  return (
    <main>
      <Container>
        <CabeceraCatalogo
          titulo={marca.nombre}
          conteo={describirCatalogo(resultado.total, productos.length)}
          imagenUrl={marca.logoUrl}
          ajusteImagen="contain"
        />

        {/* Sin catálogo que acotar la barra no ofrece nada; se muestra igual
            si hay filtros puestos, porque es la forma de quitarlos. */}
        {(resultado.total > 0 || hayFiltros) && (
          <FiltrosCatalogo
            basePath={basePath}
            facetas={facetas}
            filtros={filtros}
            ocultar={["marca"]}
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
            descripcion="Ningún producto de esta marca coincide con los filtros elegidos."
            accion={{ href: basePath, texto: "Quitar filtros" }}
          />
        ) : (
          <EstadoVacio
            titulo="Sin productos por ahora"
            descripcion="Esta marca todavía no tiene productos publicados."
            accion={{ href: "/productos", texto: "Ver todo el catálogo" }}
          />
        )}
      </Container>
    </main>
  );
}
