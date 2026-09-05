"use client";

import { Container } from "@/components/ui/Container";
import { ErrorRuta } from "@/components/ui/ErrorRuta";

export default function ErrorTienda({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main>
      <Container>
        <ErrorRuta
          error={error}
          retry={retry}
          titulo="No pudimos cargar esta parte de la tienda"
          descripcion="El catálogo no respondió a tiempo. Reintenta en un momento; tu carrito sigue guardado."
          volver={{ href: "/", texto: "Ir al inicio" }}
        />
      </Container>
    </main>
  );
}
