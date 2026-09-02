import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { CarritoContenido } from "@/components/carrito/CarritoContenido";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa los productos que agregaste antes de pagar.",
};

export default function CarritoPage() {
  return (
    <main>
      <Container>
        <PageHeader titulo="Carrito" descripcion="Revisa tu pedido antes de pagar" />
        <CarritoContenido />
      </Container>
    </main>
  );
}
