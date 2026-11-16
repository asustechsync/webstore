import { Button } from "@webstore/ui";
import { env } from "@/env";

export function BrandBanner() {
  return (
    <section
      aria-labelledby="brand-banner"
      className="mt-6 mb-8 rounded-card bg-linear-to-br from-surface-inverse-muted to-surface-inverse px-6 py-16 text-center text-foreground-inverse"
    >
      <h2 id="brand-banner" className="mx-auto max-w-lg text-3xl font-extrabold uppercase leading-tight">
        Renueva tu cajón con lo mejor en básicos
      </h2>
      <p className="mx-auto mt-3 mb-6 max-w-md text-xs text-foreground-inverse-muted">
        Mira todas las colecciones de {env.NEXT_PUBLIC_STORE_NAME}. Siempre hay un par nuevo esperando.
      </p>
      <Button size="sm" variant="secondary" disabled>
        Conocer más
      </Button>
    </section>
  );
}
