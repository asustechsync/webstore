import { formatPrice, type SampleProduct } from "@/lib/sample-products";
import { Garment } from "./garment";

/**
 * Tarjeta de producto: siempre visible como tarjeta blanca elevada (sombra suave).
 * "Vista rápida" se conecta cuando exista el módulo catalog.
 */
export function ProductCard({ product }: { product: SampleProduct }) {
  const soldOut = product.badge === "Agotado";
  const savings = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-surface shadow-xl shadow-black/5">
      <div className="relative grid aspect-square place-items-center bg-border">
        {product.badge && (
          <span className={`absolute left-2.5 top-2 text-[11px] font-bold ${soldOut ? "text-foreground-muted" : "text-brand"}`}>
            {product.badge}
          </span>
        )}
        <Garment
          kind={product.kind}
          color={product.color}
          className={`w-[56%] drop-shadow-[0_10px_8px_rgb(0_0_0/0.15)] ${soldOut ? "opacity-50 grayscale" : ""}`}
        />
      </div>

      <div className="p-3">
      <h3 className="text-sm leading-snug font-bold">{product.name}</h3>
      <p className="mt-0.5 text-xs text-foreground-muted">{product.brand}</p>
      <p className="mt-1 text-xs text-foreground-muted">
        <span className="text-star">★</span> {product.rating}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-sm">
          {formatPrice(product.price)}
          {product.oldPrice && (
            <s className="ml-1.5 text-foreground-muted">{formatPrice(product.oldPrice)}</s>
          )}
        </p>
        <button
          type="button"
          disabled={soldOut}
          aria-label={soldOut ? "Agotado" : `Agregar ${product.name} al carrito`}
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-border transition-colors enabled:hover:bg-foreground/10 disabled:text-foreground-muted"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
            <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" />
          </svg>
        </button>
      </div>
      {savings > 0 && <p className="text-sm text-brand">Ahorra {savings}%</p>}
      </div>
    </article>
  );
}
