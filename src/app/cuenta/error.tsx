"use client";

import { ErrorRuta } from "@/components/ui/ErrorRuta";

export default function ErrorCuenta({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorRuta
      error={error}
      retry={retry}
      titulo="No pudimos cargar tus datos"
      descripcion="Hubo un problema al traer la información de tu cuenta. Reintenta en un momento."
      volver={{ href: "/cuenta", texto: "Volver a mi cuenta" }}
    />
  );
}
