import Image from "next/image";
import { formatPrice, type SampleProduct } from "@/lib/sample-products";
import { Garment } from "./garment";
import { FOTO_FONDO_FILTER } from "./photo-background-filter";

/** Muestras visibles; si hay más colores, se muestra un "+N". */
const MAX_SWATCHES = 3;

/**
 * Muestra de color: círculo liso, o dividido en mitades (2 colores), una mitad y dos cuartos (3)
 * o cuatro cuadrantes (4). Se arma con una grilla para que los cortes sean exactos y simétricos.
 */
function Swatch({ color }: { color: string | string[] }) {
  const parts = Array.isArray(color) ? color.slice(0, 4) : [color];
  return (
    <span
      className="grid size-6 overflow-hidden rounded-full border border-black/15"
      style={{
        gridTemplateColumns: parts.length > 1 ? "1fr 1fr" : "1fr",
        gridTemplateRows: parts.length > 2 ? "1fr 1fr" : "1fr",
      }}
    >
      {parts.map((c, i) => (
        <i key={`${c}-${i}`} style={{ background: c, gridRow: parts.length === 3 && i === 0 ? "span 2" : undefined }} />
      ))}
    </span>
  );
}

/**
 * Tarjeta de producto (estilo de la card de prueba): tarjeta blanca elevada con imagen cuadrada,
 * muestra de color, título en una línea, precio con ahorro, marca y valoración, y "Vista rápida".
 * "Vista rápida" se conecta cuando exista el módulo catalog.
 */
export function ProductCard({ product }: { product: SampleProduct }) {
  const soldOut = product.badge === "Agotado";
  const colors = product.colors ?? [product.color];
  const savings = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <article className="group relative isolate flex flex-col before:pointer-events-none before:absolute before:-inset-3 before:-z-10 before:rounded-2xl before:bg-surface before:opacity-0 before:shadow-xl before:shadow-black/5 before:transition-opacity before:duration-200 hover:before:opacity-100">
      <div className={`relative grid aspect-[12/13] place-items-center overflow-hidden rounded-lg bg-[#f3f3f3]`}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
            style={product.imageCover ? { filter: FOTO_FONDO_FILTER } : undefined}
            className={`${product.imageCover ? "object-contain" : "object-contain p-6 mix-blend-multiply"} ${soldOut ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <Garment
            kind={product.kind}
            color={product.color}
            className={`w-[56%] drop-shadow-[0_10px_8px_rgb(0_0_0/0.15)] ${soldOut ? "opacity-50 grayscale" : ""}`}
          />
        )}
      </div>

      <div className="flex-1 px-1 pt-3">
        <div className="mb-2 flex gap-1" aria-hidden="true">
          {colors.slice(0, MAX_SWATCHES).map((c, i) => (
            <span
              key={Array.isArray(c) ? c.join("-") : c}
              className={`grid size-8 place-items-center rounded-full border ${i === 0 ? "border-foreground" : "border-transparent"}`}
            >
              <Swatch color={c} />
            </span>
          ))}
          {colors.length > MAX_SWATCHES && (
            <span className="grid h-8 min-w-8 place-items-center px-1 text-sm text-foreground-muted">
              +{colors.length - MAX_SWATCHES}
            </span>
          )}
        </div>
        <p className="mb-0.5 text-sm text-foreground-muted">{product.brand}</p>
        <h3 className="truncate text-base leading-[1.15] font-medium tracking-[0px]">{product.name}</h3>
        <p className="mt-1 text-base">
          {formatPrice(product.price)}
          {product.oldPrice && <s className="ml-1.5 text-foreground-muted">{formatPrice(product.oldPrice)}</s>}
          {savings > 0 && <span className="ml-1.5 text-[#1f4e8c]">Ahorra {savings}%</span>}
        </p>
      </div>

      <button
        type="button"
        disabled={soldOut}
        aria-label={soldOut ? `${product.name}: agotado` : `Vista rápida de ${product.name}`}
        className="mt-3 h-10 w-full rounded-lg bg-[#f8f8f4] text-base font-bold transition-colors enabled:hover:bg-foreground/10 disabled:text-foreground-muted"
      >
        {soldOut ? "Agotado" : "Vista rápida"}
      </button>
    </article>
  );
}
