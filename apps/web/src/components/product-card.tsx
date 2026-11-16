import { formatPrice, type SampleProduct } from "@/lib/sample-products";
import { Garment } from "./garment";

export function ProductCard({ product }: { product: SampleProduct }) {
  const soldOut = product.badge === "Agotado";

  return (
    <article
      className={`relative rounded-tile border border-border bg-surface p-2 transition hover:-translate-y-0.5 hover:shadow-lg ${
        soldOut ? "opacity-75" : ""
      }`}
    >
      <div className="relative mb-2 grid aspect-square place-items-center rounded-lg bg-surface-muted">
        {product.badge && (
          <span className={`absolute left-2 top-2 text-[11px] font-bold ${soldOut ? "text-foreground-muted" : "text-brand"}`}>
            {product.badge}
          </span>
        )}
        <span
          aria-hidden="true"
          className={`absolute right-2 top-1.5 text-sm ${product.favorite ? "text-brand" : "text-foreground-muted"}`}
        >
          {product.favorite ? "♥" : "♡"}
        </span>
        <Garment kind={product.kind} color={product.color} className="w-[56%]" />
      </div>
      <h3 className="truncate text-xs font-semibold">{product.name}</h3>
      <p className="text-[11px] text-foreground-muted">
        <span className="text-star">★</span> {product.rating} · {product.sold} vendidos
      </p>
      <p className="mt-0.5 text-sm font-extrabold">
        {formatPrice(product.price)}
        {product.oldPrice && (
          <s className="ml-1 text-[11px] font-medium text-foreground-muted">{formatPrice(product.oldPrice)}</s>
        )}
      </p>
    </article>
  );
}
