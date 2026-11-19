import { Button } from "@webstore/ui";
import { gridProducts } from "@/lib/sample-products";
import { PhotoBackgroundFilter } from "../photo-background-filter";
import { ProductCard } from "../product-card";

/** Fila de arriba: solo medias. Fila de abajo: solo boxers. */
const socks = gridProducts.filter((p) => p.kind === "sock").slice(0, 4);
const boxers = gridProducts.filter((p) => p.kind === "boxer" && p.badge !== "Agotado").slice(0, 4);

/** Bloque de encabezado que ocupa el lugar de una card en la grilla. Los botones se activan con el módulo catalog. */
function IntroBlock({ label }: { label: string }) {
  const button =
    "h-8 cursor-not-allowed rounded-lg bg-foreground px-3 text-sm font-bold text-foreground-inverse";

  return (
    <div className="flex flex-col justify-start p-1 pt-3">
      <p className="text-sm font-bold">{label}</p>
      <h3 className="mt-1 text-3xl leading-[1.05] font-medium tracking-[0px]">Nuevos lanzamientos</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled className={button}>
          Ver todo
        </button>
        <button type="button" disabled className={button}>
          Más vendidos
        </button>
      </div>
    </div>
  );
}

export function ProductShowcase() {
  return (
    <section aria-labelledby="showcase" className="pt-20 lg:pt-28">
      <PhotoBackgroundFilter />
      <div className="text-center">
        <h2
          id="showcase"
          className="text-2xl leading-[1.1] font-bold tracking-[-0.01em] uppercase sm:text-3xl lg:text-[2.5rem]"
        >
          Compra hoy, siéntete bien después
        </h2>
        <p className="mx-auto mt-3 text-base text-foreground-muted">
          Tenemos una colección pensada para ti. Explora y encuentra tu básico ideal.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 lg:mt-14 gap-x-8 gap-y-10 md:grid-cols-3 lg:gap-y-[4.5rem] lg:grid-cols-5">
        <IntroBlock label="Mujer" />
        {socks.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        <IntroBlock label="Hombre" />
        {boxers.map((product) => (
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
