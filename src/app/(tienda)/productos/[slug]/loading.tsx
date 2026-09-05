import { Container } from "@/components/ui/Container";
import { Cargando, EsqueletoFicha } from "@/components/ui/Esqueleto";

/**
 * Carga de la ficha de producto. Sustituye al esqueleto general de la tienda
 * porque acá no hay grilla: son galería y panel de compra, uno al lado del
 * otro desde tableta.
 */
export default function CargandoProducto() {
  return (
    <main>
      <Container>
        <Cargando etiqueta="Cargando el producto">
          <EsqueletoFicha />
        </Cargando>
      </Container>
    </main>
  );
}
