import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Garment } from "@/components/garment";

export const metadata: Metadata = { title: "Prueba de fuente" };

const swatches = ["#2f3d55", "#b9b9b4", "#111111", "#8a9a7b"];

function Swatches() {
  return (
    <div className="mt-3 flex gap-2 px-1">
      {swatches.map((c, i) => (
        <span
          key={c}
          className={`size-6 rounded-full border border-border ${i === 0 ? "ring-2 ring-foreground ring-offset-2" : ""}`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function Media({ heart = false }: { heart?: boolean }) {
  return (
    <div className="relative grid aspect-square place-items-center rounded-xl bg-border">
      <span className="absolute left-2.5 top-2 text-[11px] font-bold text-brand">Nuevo</span>
      {heart && (
        <span className="absolute right-2.5 top-2 grid size-7 place-items-center rounded-full bg-surface text-sm">♡</span>
      )}
      <Garment kind="boxer" color="#2f3d55" className="w-[56%] drop-shadow-[0_10px_8px_rgb(0_0_0/0.15)]" />
      <div className="absolute bottom-2 flex gap-1">
        <i className="size-1.5 rounded-full bg-foreground" />
        <i className="size-1.5 rounded-full bg-foreground/30" />
        <i className="size-1.5 rounded-full bg-foreground/30" />
      </div>
    </div>
  );
}

function Frame({ label, children, className = "w-[16.5rem]" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`${className} shrink-0`}>
      <p className="mb-2 text-sm font-medium text-foreground-muted">{label}</p>
      <article className="rounded-2xl bg-surface p-3 shadow-xl shadow-black/5">{children}</article>
    </div>
  );
}

const title = "truncate text-base leading-[1.15] font-medium tracking-[0px]";

/** Página temporal: 3 opciones de card de producto para comparar. */
export default function PruebaFuentePage() {
  return (
    <main className="flex flex-wrap gap-8 p-8">
      <Frame label="Card de prueba original (réplica Bombas, en inglés)" className="w-[16.5rem]">
        <div className="aspect-square rounded-xl bg-[#6f9bb3]" />
        <div className="mt-3 flex gap-2 px-1">
          {["#7a3b4a", "#c9b8a4", "#111111", "#b8ad9e"].map((c) => (
            <span key={c} className="size-6 rounded-full border border-border" style={{ background: c }} />
          ))}
        </div>
        <div className="px-1 pt-3">
          <h3 className={title}>Merino Wool Blend Half Calf Sock 4-Pack</h3>
          <p className="mt-1 text-base">
            $81 <s className="text-foreground-muted">$90</s> <span className="text-[#1f4e8c]">10% Pack Savings</span>
          </p>
          <p className="mt-1 text-sm text-foreground-muted">Women · Midweight</p>
        </div>
        <button type="button" className="mt-3 h-12 w-full rounded-xl bg-surface-muted text-base font-bold">
          Quick View
        </button>
      </Frame>

      <Frame label="Opción 1 · Fiel a Bombas">
        <Media />
        <Swatches />
        <div className="px-1 pt-3">
          <h3 className={title}>Boxer corto azul noche</h3>
          <p className="mt-1 text-base">
            S/ 20 <s className="text-foreground-muted">S/ 24</s> <span className="text-brand">Ahorra 17%</span>
          </p>
          <p className="mt-1 text-sm text-foreground-muted">Pesail · Algodón pima · Corto</p>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            aria-label="Agregar a favoritos"
            className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-muted text-lg"
          >
            ♡
          </button>
          <button type="button" className="h-12 flex-1 rounded-xl bg-foreground text-base font-bold text-foreground-inverse">
            Añadir
          </button>
        </div>
      </Frame>

      <Frame label="Opción 2 · Híbrida con valoración (recomendada)">
        <Media heart />
        <Swatches />
        <div className="px-1 pt-3">
          <h3 className={title}>Boxer corto azul noche</h3>
          <p className="mt-1 text-base">
            S/ 20 <s className="text-foreground-muted">S/ 24</s> <span className="text-brand">Ahorra 17%</span>
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            Pesail · <span className="text-star">★</span> 4.9
          </p>
        </div>
        <button type="button" className="mt-3 h-12 w-full rounded-xl bg-surface-muted text-base font-bold">
          Vista rápida
        </button>
      </Frame>

      <Frame label="Opción 3 · Con botón de carrito">
        <Media />
        <Swatches />
        <div className="px-1 pt-3">
          <h3 className={title}>Boxer corto azul noche</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Pesail · <span className="text-star">★</span> 4.9
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-base">
              S/ 20 <s className="text-foreground-muted">S/ 24</s>
            </p>
            <span className="grid size-10 place-items-center rounded-xl bg-surface-muted">🛒</span>
          </div>
          <p className="text-base text-brand">Ahorra 17%</p>
        </div>
      </Frame>
    </main>
  );
}
