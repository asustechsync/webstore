"use client";

import { useState } from "react";
import { colorOptions, formatPrice, type GarmentKind, type SampleProduct } from "@/lib/sample-products";
import { Garment } from "./garment";

const kindLabel: Record<GarmentKind, string> = { boxer: "Boxer", sock: "Medias", tee: "Camiseta" };

/**
 * Tarjeta de producto: siempre visible como tarjeta blanca elevada (sombra suave).
 * "Vista rápida" se conecta cuando exista el módulo catalog.
 */
export function ProductCard({ product }: { product: SampleProduct }) {
  const soldOut = product.badge === "Agotado";
  const swatches = [product.color, ...colorOptions.filter((c) => c !== product.color)].slice(0, 6);
  const [color, setColor] = useState(product.color);
  const savings = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <article className="group relative flex flex-col rounded-2xl bg-surface p-2.5 shadow-xl shadow-black/5 transition hover:-translate-y-0.5 hover:shadow-2xl">
      <div className="relative mb-3 grid aspect-square place-items-center rounded-lg bg-border">
        {product.badge && (
          <span className={`absolute left-2.5 top-2 text-[11px] font-bold ${soldOut ? "text-foreground-muted" : "text-brand"}`}>
            {product.badge}
          </span>
        )}
        <span
          aria-hidden="true"
          className={`absolute right-2.5 top-1.5 text-sm ${product.favorite ? "text-brand" : "text-foreground-muted"}`}
        >
          {product.favorite ? "♥" : "♡"}
        </span>
        <Garment
          kind={product.kind}
          color={color}
          className={`w-[56%] drop-shadow-[0_10px_8px_rgb(0_0_0/0.15)] ${soldOut ? "opacity-50 grayscale" : ""}`}
        />
        {/* Indicador del carrusel de fotos: decorativo hasta tener varias imágenes por producto. */}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          <i className="size-1.5 rounded-full bg-foreground/25" />
          <i className="h-1.5 w-4 rounded-full bg-foreground/60" />
          <i className="size-1.5 rounded-full bg-foreground/25" />
        </span>
      </div>

      <div role="radiogroup" aria-label="Color" className="mb-2.5 flex gap-2 px-0.5">
        {swatches.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === color}
            aria-label={`Color ${c}`}
            onClick={() => setColor(c)}
            className={`size-5 rounded-md border border-black/10 ${
              c === color ? "ring-1 ring-foreground ring-offset-2" : ""
            }`}
            style={{ background: c }}
          />
        ))}
      </div>

      <h3 className="text-sm leading-snug font-bold">{product.name}</h3>
      <p className="mt-1 text-sm">
        {formatPrice(product.price)}
        {product.oldPrice && (
          <s className="ml-1.5 text-foreground-muted">{formatPrice(product.oldPrice)}</s>
        )}
      </p>
      {savings > 0 && <p className="text-sm text-brand">Ahorra {savings}%</p>}
      <p className="mt-1 text-xs text-foreground-muted">
        {kindLabel[product.kind]} · <span className="text-star">★</span> {product.rating} · {product.sold} vendidos
      </p>

      <div className="mt-auto pt-3.5">
        <button
          type="button"
          disabled={soldOut}
          className="w-full rounded-lg bg-border py-2.5 text-sm font-bold transition-colors enabled:hover:bg-foreground/10 disabled:text-foreground-muted"
        >
          {soldOut ? "Agotado" : "Vista rápida"}
        </button>
      </div>
    </article>
  );
}
