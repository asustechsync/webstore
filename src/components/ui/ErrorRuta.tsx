"use client";

import { useEffect } from "react";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";
import styles from "@/styles/ui.module.css";
import propios from "./ErrorRuta.module.css";

/**
 * Pantalla compartida por los `error.tsx` de cada sección.
 *
 * Los límites de error de Next tienen que ser componentes cliente, así que
 * este archivo concentra el "use client" y las tres secciones (tienda, panel,
 * cuenta) solo le pasan su texto.
 *
 * En producción Next no manda el mensaje real de un error de servidor: llega
 * uno genérico más un `digest`. Por eso el texto que ve la persona es nuestro
 * y el digest se muestra aparte, que es lo único que sirve para cruzarlo con
 * los registros del servidor.
 */
export function ErrorRuta({
  error,
  retry,
  titulo = "No pudimos cargar esta página",
  descripcion = "Hubo un problema al traer la información. Vuelve a intentarlo en un momento.",
  volver,
}: {
  error: Error & { digest?: string };
  /** Reintenta el renderizado del segmento; la da Next al límite de error. */
  retry: () => void;
  titulo?: string;
  descripcion?: string;
  volver?: { href: string; texto: string };
}) {
  useEffect(() => {
    // Queda en la consola del navegador y en los registros del servidor.
    // Cuando haya un servicio de monitoreo, este es el punto donde reportarlo.
    console.error(error);
  }, [error]);

  return (
    <div className={styles.vacio}>
      <p className={styles.seccionTitulo}>{titulo}</p>
      <p>{descripcion}</p>

      <div className={propios.acciones}>
        <Button variante="primario" anchoCompleto={false} onClick={() => retry()}>
          Reintentar
        </Button>
        {volver ? (
          <LinkButton href={volver.href} variante="secundario" anchoCompleto={false}>
            {volver.texto}
          </LinkButton>
        ) : null}
      </div>

      {/* Sin digest no hay nada que reportar: se omite en vez de mostrar vacío. */}
      {error.digest ? (
        <p className={propios.digest}>
          Código del error: <code>{error.digest}</code>
        </p>
      ) : null}
    </div>
  );
}
