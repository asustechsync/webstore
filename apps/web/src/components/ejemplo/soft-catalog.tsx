"use client";

import { useMemo, useState } from "react";
import { Garment } from "@/components/garment";
import {
  dealProducts,
  formatPrice,
  gridProducts,
  type GarmentKind,
  type SampleProduct,
} from "@/lib/sample-products";

const catalog: SampleProduct[] = [...gridProducts, ...dealProducts];

const kindLabel: Record<GarmentKind, string> = { boxer: "Boxer", sock: "Medias", tee: "Camiseta" };
const kindDetail: Record<GarmentKind, string> = {
  boxer: "Boxer, algodón pima",
  sock: "Medias, algodón peinado",
  tee: "Camiseta, algodón pima",
};

const priceRanges = [
  { label: "Menos de S/ 30", test: (p: number) => p < 30 },
  { label: "S/ 30 a S/ 40", test: (p: number) => p >= 30 && p < 40 },
  { label: "S/ 40 a S/ 50", test: (p: number) => p >= 40 && p < 50 },
  { label: "Más de S/ 50", test: (p: number) => p >= 50 },
];

const sorts = {
  featured: { label: "Destacados", fn: () => 0 },
  asc: { label: "Precio: menor a mayor", fn: (a: SampleProduct, b: SampleProduct) => a.price - b.price },
  desc: { label: "Precio: mayor a menor", fn: (a: SampleProduct, b: SampleProduct) => b.price - a.price },
  sold: { label: "Más vendidos", fn: (a: SampleProduct, b: SampleProduct) => b.sold - a.sold },
} as const;
type SortKey = keyof typeof sorts;

const isOut = (p: SampleProduct) => p.badge === "Agotado";
const toggle = <T,>(set: Set<T>, value: T) => {
  const next = new Set(set);
  if (!next.delete(value)) next.add(value);
  return next;
};

const pill = "rounded-full bg-surface px-5 py-2.5 text-sm font-medium shadow-sm transition-colors";

export function SoftCatalog({ storeName }: { storeName: string }) {
  const [kinds, setKinds] = useState<Set<GarmentKind>>(new Set());
  const [colors, setColors] = useState<Set<string>>(new Set());
  const [range, setRange] = useState<number | null>(null);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [bag, setBag] = useState(0);

  const colorList = useMemo(() => [...new Set(catalog.map((p) => p.color))], []);
  const kindCount = (k: GarmentKind) => catalog.filter((p) => p.kind === k).length;
  const rangeCount = priceRanges.map((r) => catalog.filter((p) => r.test(p.price)).length);
  const maxRange = Math.max(...rangeCount);

  const products = useMemo(
    () =>
      catalog
        .filter((p) => !kinds.size || kinds.has(p.kind))
        .filter((p) => !colors.size || colors.has(p.color))
        .filter((p) => range === null || priceRanges[range]!.test(p.price))
        .filter((p) => !inStock || !isOut(p))
        .sort(sorts[sort].fn),
    [kinds, colors, range, inStock, sort],
  );

  const featured = dealProducts[0]!;

  return (
    <div className="theme-soft min-h-dvh bg-surface-muted pb-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Barra de navegación en píldoras */}
        <header className="flex flex-wrap items-center gap-3 py-6">
          <button
            type="button"
            aria-label="Buscar"
            className="grid size-14 place-items-center rounded-full bg-foreground text-foreground-inverse"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
          </button>
          <span className="mr-3 text-3xl font-semibold tracking-tight">
            {storeName}
            <span className="text-brand">.</span>
          </span>
          <nav aria-label="Principal" className="flex flex-wrap gap-2">
            <a href="#" className={pill}>Tienda</a>
            <a href="#" aria-current="page" className={`${pill} bg-foreground! text-foreground-inverse`}>Esenciales</a>
            <a href="#" className={pill}>Ropa interior</a>
            <a href="#" className={pill}>Medias</a>
          </nav>
          <div className="ml-auto flex items-center gap-3 rounded-full bg-surface py-1.5 pr-1.5 pl-6 shadow-sm">
            <span className="text-sm font-medium">Bolsa</span>
            <span className="grid size-11 place-items-center rounded-full bg-foreground text-sm font-semibold text-foreground-inverse">
              {bag}
            </span>
          </div>
        </header>

        {/* Cabecera de categoría */}
        <section className="relative grid items-end gap-8 pt-2 pb-12 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-foreground-muted">Tienda / Esenciales</p>
            <h1 className="mt-4 text-[clamp(3.5rem,11vw,9rem)] leading-[0.92] font-medium tracking-tighter">
              Esenciales
            </h1>
            <p className="mt-6 max-w-md text-lg text-foreground-muted">
              Básicos de algodón pima para el día a día, filtrados por prenda, color, precio y stock.
            </p>
          </div>

          <div className="relative hidden h-72 w-[34rem] lg:block" aria-hidden="true">
            <Garment kind="tee" color="#e9e1cf" className="absolute top-0 left-4 size-44 drop-shadow-[0_18px_14px_rgb(0_0_0/0.18)]" />
            <Garment kind="boxer" color="#2f3d55" className="absolute top-6 left-48 size-52 drop-shadow-[0_18px_14px_rgb(0_0_0/0.2)]" />
            <Garment kind="sock" color="#b5532f" className="absolute top-6 left-96 size-36 drop-shadow-[0_16px_12px_rgb(0_0_0/0.18)]" />
            <Garment kind="boxer" color="#111111" className="absolute top-36 left-0 size-32 drop-shadow-[0_16px_12px_rgb(0_0_0/0.2)]" />
            <div className="absolute top-44 right-0 flex w-72 items-center gap-4 rounded-[2rem] bg-surface p-3 pr-4 shadow-xl shadow-black/5">
              <div className="grid size-20 place-items-center rounded-2xl bg-surface-tile">
                <Garment kind={featured.kind} color={featured.color} className="size-14" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{featured.name}</p>
                <p className="text-sm text-foreground-muted">{kindLabel[featured.kind]}, pima</p>
                <p className="mt-1 font-semibold">{formatPrice(featured.price)}</p>
              </div>
              <span className="grid size-12 place-items-center rounded-full bg-brand text-xl text-brand-foreground shadow-lg shadow-brand/40">
                ↗
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[18.5rem_1fr]">
          {/* Filtros */}
          <aside aria-label="Filtros" className="h-fit rounded-[2rem] bg-surface p-7 lg:sticky lg:top-6">
            <h2 className="text-xl font-semibold">Filtros</h2>

            <FilterTitle>Prenda</FilterTitle>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(kindLabel) as GarmentKind[]).map((k) => (
                <Chip key={k} active={kinds.has(k)} onClick={() => setKinds(toggle(kinds, k))}>
                  {kindLabel[k]} <span className="text-foreground-muted">{kindCount(k)}</span>
                </Chip>
              ))}
            </div>

            <FilterTitle>Color</FilterTitle>
            <div className="flex flex-wrap gap-2.5">
              {colorList.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  aria-pressed={colors.has(c)}
                  onClick={() => setColors(toggle(colors, c))}
                  className={`size-8 rounded-full border border-black/10 transition-shadow ${
                    colors.has(c) ? "ring-2 ring-foreground ring-offset-2" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>

            <FilterTitle>Precio</FilterTitle>
            <ul className="flex flex-col gap-3">
              {priceRanges.map((r, i) => (
                <li key={r.label}>
                  <button
                    type="button"
                    aria-pressed={range === i}
                    onClick={() => setRange(range === i ? null : i)}
                    className={`flex w-full items-center gap-3 text-sm ${range === i ? "font-semibold" : ""}`}
                  >
                    <span className="w-28 text-left">{r.label}</span>
                    <span className="hatch h-2 flex-1 overflow-hidden rounded-full">
                      <span
                        className="block h-full rounded-full bg-foreground/35"
                        style={{ width: `${(rangeCount[i]! / maxRange) * 100}%` }}
                      />
                    </span>
                    <span className="w-5 text-right text-foreground-muted">{rangeCount[i]}</span>
                  </button>
                </li>
              ))}
            </ul>

            <FilterTitle>Disponibilidad</FilterTitle>
            <div className="flex items-center justify-between text-sm">
              <span>
                En stock <span className="text-foreground-muted">{catalog.filter((p) => !isOut(p)).length}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={inStock}
                aria-label="Solo en stock"
                onClick={() => setInStock(!inStock)}
                className={`relative h-8 w-14 rounded-full transition-colors ${inStock ? "bg-foreground" : "bg-surface-tile"}`}
              >
                <span
                  className={`absolute top-1 size-6 rounded-full bg-surface shadow transition-all ${
                    inStock ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </aside>

          {/* Productos */}
          <section aria-label="Productos">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-lg">
                {products.length} <span className="text-foreground-muted">productos</span>
              </p>
              <label className="flex items-center gap-2 rounded-full bg-surface py-2.5 pr-4 pl-5 text-sm shadow-sm">
                <span className="text-foreground-muted">Ordenar por</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-transparent font-medium outline-none"
                >
                  {(Object.keys(sorts) as SortKey[]).map((k) => (
                    <option key={k} value={k}>
                      {sorts[k].label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {products.length === 0 ? (
              <p className="rounded-[2rem] bg-surface p-10 text-center text-foreground-muted">
                Ningún producto coincide con estos filtros.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductTile key={p.id} product={p} onAdd={() => setBag((n) => n + 1)} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterTitle({ children }: { children: string }) {
  return <h3 className="mt-7 mb-3 text-sm text-foreground-muted">{children}</h3>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-foreground text-foreground-inverse" : "bg-surface-muted"
      }`}
    >
      {children}
    </button>
  );
}

function ProductTile({ product: p, onAdd }: { product: SampleProduct; onAdd: () => void }) {
  const out = isOut(p);
  return (
    <li className="rounded-[2rem] bg-surface p-3.5">
      <div className={`grid aspect-[4/3] place-items-center rounded-3xl bg-surface-tile ${out ? "hatch" : ""}`}>
        <Garment
          kind={p.kind}
          color={p.color}
          className={`size-32 drop-shadow-[0_16px_12px_rgb(0_0_0/0.18)] ${out ? "opacity-40 grayscale" : ""}`}
        />
      </div>
      <div className={`px-2 pt-4 pb-1 ${out ? "text-foreground-muted" : ""}`}>
        <h3 className="text-lg font-medium">{p.name}</h3>
        <p className="text-sm text-foreground-muted">{kindDetail[p.kind]}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="flex items-baseline gap-2">
            <span className="text-2xl font-medium">{formatPrice(p.price)}</span>
            <span className="text-xs text-foreground-muted">{out ? "Agotado" : "En stock"}</span>
          </p>
          {out ? (
            <span aria-hidden="true" className="size-12 rounded-full border border-border" />
          ) : (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Agregar ${p.name} a la bolsa`}
              className="grid size-12 place-items-center rounded-full bg-foreground text-2xl text-foreground-inverse transition-transform hover:scale-105"
            >
              +
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
