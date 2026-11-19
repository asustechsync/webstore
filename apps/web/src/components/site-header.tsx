import Link from "next/link";
import { env } from "@/env";

/** Los enlaces y el buscador se conectan cuando existan los módulos catalog, auth y cart. */
export function SiteHeader() {
  return (
    <header>
      <div className="bg-black text-[11px] text-foreground-inverse-muted">
        <div className="mx-auto max-w-[96rem] flex h-8 items-center justify-between px-4 sm:px-8 lg:px-14">
          <p className="flex gap-5">
            <span>Vender con nosotros</span>
            <span>Ayuda</span>
            <span className="hidden sm:inline">Descargar la app</span>
          </p>
          <p>Español · PEN</p>
        </div>
      </div>
      <div className="bg-surface">
        <div className="mx-auto max-w-[96rem] flex h-17 items-center gap-6 px-4 sm:px-8 lg:px-14">
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold">
            <span aria-hidden="true" className="inline-block h-4 w-7 rounded-full border-[3px] border-foreground" />
            {env.NEXT_PUBLIC_STORE_NAME}
          </Link>
          <input
            type="search"
            disabled
            aria-label="Buscar productos"
            placeholder="Prueba “boxer algodón pima”"
            className="hidden h-10 flex-1 rounded-control bg-surface-muted px-4 text-sm placeholder:text-foreground-muted md:block"
          />
          <nav aria-label="Principal" className="ml-auto flex items-center gap-5 text-xs font-semibold">
            <span aria-hidden="true">♡</span>
            <span>
              Bolsa <span className="rounded-full bg-brand px-2 py-0.5 text-brand-foreground">0</span>
            </span>
            <span className="hidden sm:inline">Mi cuenta</span>
          </nav>
        </div>
      </div>
    </header>
  );
}
