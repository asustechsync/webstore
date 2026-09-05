import { Container } from "@/components/ui/Container";
import {
  Cargando,
  EsqueletoCabecera,
  EsqueletoGrid,
} from "@/components/ui/Esqueleto";

/**
 * Carga de la tienda. Cubre la portada, el catálogo, las categorías y las
 * marcas, que son todas variaciones de "cabecera + grilla de productos".
 *
 * La ficha de producto tiene su propio loading porque su forma es distinta.
 */
export default function CargandoTienda() {
  return (
    <main>
      <Container>
        <Cargando etiqueta="Cargando la tienda">
          <EsqueletoCabecera />
          <EsqueletoGrid tarjetas={8} />
        </Cargando>
      </Container>
    </main>
  );
}
