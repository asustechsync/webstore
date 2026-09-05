import { Container } from "@/components/ui/Container";
import {
  Cargando,
  EsqueletoCabecera,
  EsqueletoFormulario,
} from "@/components/ui/Esqueleto";

/**
 * Carga del checkout. Sustituye al esqueleto general de la tienda: acá no hay
 * catálogo que mostrar, sino el formulario de envío y pago. Enseñar una
 * grilla de productos en esta pantalla sería engañoso.
 */
export default function CargandoCheckout() {
  return (
    <main>
      <Container>
        <Cargando etiqueta="Cargando el checkout">
          <EsqueletoCabecera />
          <EsqueletoFormulario campos={6} />
        </Cargando>
      </Container>
    </main>
  );
}
