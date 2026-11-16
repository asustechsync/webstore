import { collections } from "@/lib/sample-products";
import { Garment } from "../garment";

export function Collections() {
  return (
    <section aria-labelledby="collections" className="pt-14">
      <div className="text-center">
        <h2 id="collections" className="text-3xl font-extrabold tracking-tight">
          Nuestras colecciones
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-foreground-muted">
          Tres líneas pensadas para cada momento del día.
        </p>
      </div>
      <div className="mt-6 grid gap-3.5 md:grid-cols-3">
        {collections.map((collection) => (
          <article key={collection.id} className="rounded-card bg-surface p-4">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{collection.name}</h3>
                <p className="text-[11px] text-foreground-muted">
                  <span className="text-star">★</span> 4.9 · {collection.reviews}
                </p>
              </div>
              <span className="text-xs font-semibold">Visitar</span>
            </header>
            <div className="grid grid-cols-2 gap-2">
              {collection.items.map((item, index) => (
                <div key={index} className="grid aspect-[1.15] place-items-center rounded-tile bg-surface-muted">
                  <Garment kind={item.kind} color={item.color} className="w-[44%]" />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
