import { Button } from "@webstore/ui";
import { Garment } from "../garment";

export function HeroBanners() {
  return (
    <section aria-label="Destacados" className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <div className="relative min-h-72 overflow-hidden rounded-card bg-surface p-8">
        <p className="text-sm font-bold text-brand">¡NUEVO!</p>
        <h1 className="mt-2 max-w-64 text-3xl font-extrabold uppercase leading-tight">Pack boxer pima x3</h1>
        <p className="mt-3 mb-6 max-w-64 text-xs text-foreground-muted">
          Suaves, sin etiqueta y con costura plana. El básico que sí se queda en tu cajón.
        </p>
        <Button size="sm" className="bg-surface-inverse text-foreground-inverse hover:bg-brand" disabled>
          Ver producto
        </Button>
        <div className="mt-4 flex gap-2 sm:absolute sm:right-6 sm:top-6 sm:mt-0 sm:w-[46%]">
          <Garment kind="boxer" color="#2f3d55" className="w-1/2 drop-shadow-lg" />
          <Garment kind="boxer" color="#8a9a7b" className="mt-6 w-1/2 drop-shadow-lg" />
        </div>
      </div>

      <div className="relative min-h-72 overflow-hidden rounded-card bg-promo p-8 text-promo-foreground">
        <h2 className="max-w-72 text-2xl font-extrabold uppercase leading-tight">Hasta 50% en packs de medias</h2>
        <p className="mt-3 mb-6 max-w-64 text-xs">
          Semana del básico: elige 3 y llévate el más barato gratis. Hasta agotar stock.
        </p>
        <Button size="sm" variant="secondary" disabled>
          Ver ofertas
        </Button>
        <Garment kind="sock" color="#ffffff" className="absolute -bottom-2 -right-2 w-2/5 opacity-95" />
      </div>
    </section>
  );
}
