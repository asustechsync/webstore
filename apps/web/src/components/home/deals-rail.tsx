import { Button } from "@webstore/ui";
import { dealProducts, formatPrice, type SampleProduct } from "@/lib/sample-products";
import { Garment } from "../garment";
import { Countdown } from "./countdown";

const discount = (product: SampleProduct) =>
  product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

function DiscountPill({ product, className = "" }: { product: SampleProduct; className?: string }) {
  return (
    <span className={`rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand ${className}`}>
      -{discount(product)}%
    </span>
  );
}

function FeaturedDeal({ product }: { product: SampleProduct }) {
  const progress = product.stock ? Math.min(100, Math.round((product.sold / product.stock) * 100)) : null;

  return (
    <article className="flex flex-col gap-3 rounded-card bg-surface-muted p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
          Oferta del día · -{discount(product)}%
        </span>
        <Countdown className="text-[11px] tabular-nums text-foreground-muted" />
      </div>
      <div className="grid flex-1 place-items-center py-2">
        <Garment kind={product.kind} color={product.color} className="w-28" />
      </div>
      <h3 className="text-sm font-medium">{product.name}</h3>
      <p className="text-xl font-semibold">
        {formatPrice(product.price)}
        {product.oldPrice && (
          <s className="ml-2 text-xs font-normal text-foreground-muted">{formatPrice(product.oldPrice)}</s>
        )}
      </p>
      {progress !== null && (
        <div>
          <div
            role="progressbar"
            aria-label="Unidades vendidas"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1 rounded-full bg-border"
          >
            <div className="h-1 rounded-full bg-surface-inverse" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-foreground-muted">
            {product.sold} de {product.stock} vendidos
          </p>
        </div>
      )}
      <Button size="sm" className="self-start bg-surface-inverse text-foreground-inverse hover:bg-brand">
        Comprar ahora
      </Button>
    </article>
  );
}

function MiniDeal({ product }: { product: SampleProduct }) {
  return (
    <article>
      <div className="relative grid aspect-[1.2] place-items-center rounded-tile bg-surface-muted">
        <DiscountPill product={product} className="absolute left-2 top-2 bg-surface" />
        <Garment kind={product.kind} color={product.color} className="w-[38%]" />
      </div>
      <h3 className="mt-1.5 truncate text-xs font-medium">{product.name}</h3>
      <p className="text-sm font-medium">
        {formatPrice(product.price)}
        {product.oldPrice && (
          <s className="ml-1 text-[11px] font-normal text-foreground-muted">{formatPrice(product.oldPrice)}</s>
        )}
      </p>
    </article>
  );
}

export function DealsRail() {
  const [featured, ...others] = dealProducts;
  if (!featured) return null;

  return (
    <section aria-labelledby="deals" className="rounded-card bg-surface p-4">
      <h2 id="deals" className="sr-only">
        Ofertas de hoy
      </h2>
      <div className="grid gap-4 md:grid-cols-[1.05fr_1fr]">
        <FeaturedDeal product={featured} />
        <div className="grid grid-cols-2 content-start gap-3">
          {others.slice(0, 4).map((product) => (
            <MiniDeal key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
