import { Button } from "@webstore/ui";
import { gridProducts } from "@/lib/sample-products";
import { ProductCard } from "../product-card";

/** Los filtros se activan con el módulo catalog (paso 2). */
const filters = ["Boxers", "Precio", "Talla", "Color"];

export function ProductShowcase() {
  return (
    <section aria-labelledby="showcase" className="pt-14">
      <div className="text-center">
        <h2 id="showcase" className="text-3xl font-extrabold tracking-tight">
          Compra hoy, siéntete bien después
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-foreground-muted">
          Tenemos una colección pensada para ti. Explora y encuentra tu básico ideal.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {filters.map((label) => (
            <button
              key={label}
              type="button"
              disabled
              className="flex min-w-28 cursor-not-allowed items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold"
            >
              {label} <span aria-hidden="true">⌄</span>
            </button>
          ))}
          <button
            type="button"
            disabled
            className="ml-2 flex cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold"
          >
            Más filtros <span aria-hidden="true">☰</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {gridProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button size="sm" className="bg-surface-inverse text-foreground-inverse hover:bg-brand" disabled>
          Ver más
        </Button>
      </div>
    </section>
  );
}
