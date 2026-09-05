"use client";

import { ErrorRuta } from "@/components/ui/ErrorRuta";

export default function ErrorAdmin({
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
      titulo="No pudimos cargar esta sección del panel"
      descripcion="La consulta a la base no respondió. Reintenta; si vuelve a fallar, anota el código de abajo."
      volver={{ href: "/admin", texto: "Volver al panel" }}
    />
  );
}
