import { dealProducts } from "@/lib/sample-products";
import { ProductCard } from "../product-card";

export function DealsRail() {
  return (
    <section aria-labelledby="deals" className="rounded-card bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="deals" className="text-sm font-bold">
          Ofertas de hoy
        </h2>
        <span className="rounded bg-brand px-2 py-0.5 text-[11px] font-bold text-brand-foreground">Termina hoy</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {dealProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
