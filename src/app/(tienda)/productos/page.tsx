import type { Metadata } from "next";
import { Suspense } from "react";
import { listarFacetas, listarProductos } from "@/features/catalogo/queries/productos";
import {
  contarFiltrosActivos,
  leerFiltros,
  type ParametrosBusqueda,
} from "@/features/catalogo/filtros";
import { Container } from "@/components/ui/Container";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { PageHeader } from "@/components/ui/PageHeader";
import { EsqueletoGrid } from "@/components/ui/Esqueleto";
import { FiltrosCatalogo } from "@/components/catalogo/FiltrosCatalogo";
import { Paginacion } from "@/components/catalogo/Paginacion";
import { ProductosGrid } from "@/components/productos/ProductosGrid";
import { aProductosCardData } from "@/components/productos/ProductoCard";
import { describirCatalogo } from "@/lib/utils";
import compartidos from "@/styles/ui.module.css";

export const metadata: Metadata = {
  title: "Productos",
  description: "Todo el catálogo de Webstore.",
};

// El armazón (cabecera + filtros) es estático; solo `Resultados` depende de
// `searchParams` y está aislado en un `<Suspense>` más abajo. `instant = true`
// mantiene esta ruta bajo validación aunque el resto del sitio ya no se
// valide por defecto (ver next.config.ts).
export const instant = true;

type Props = { searchParams: Promise<ParametrosBusqueda> };

/**
 * Resultados del catálogo: lo único que depende de la URL.
 *
 * Está separado del resto de la página a propósito. `searchParams` es dato de
 * petición, y leerlo directamente en la página impediría prerenderizar nada:
 * aislado acá dentro de un `<Suspense>`, la cabecera y el armazón se sirven
 * pre-construidos al instante y solo esta parte llega por streaming.
 */
async function Resultados({ searchParams }: Props) {
  const parametros = await searchParams;
  const filtros = leerFiltros(parametros);

  const [resultado, facetas] = await Promise.all([listarProductos(filtros), listarFacetas()]);
  const productosCard = resultado.productos.flatMap(aProductosCardData);
  const hayFiltros = contarFiltrosActivos(filtros) > 0;

  return (
    <>
      {resultado.total > 0 ? (
        <p className={compartidos.subtitulo}>
          {describirCatalogo(resultado.total, productosCard.length)}
        </p>
      ) : null}

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
    </>
  );
}

export default function ProductosPage({ searchParams }: Props) {
  return (
    <main>
      <Container>
        {/* Fuera del Suspense: es igual para todos y entra en el armazón. */}
        <PageHeader titulo="Productos" />

        <Suspense fallback={<EsqueletoGrid tarjetas={8} />}>
          <Resultados searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
