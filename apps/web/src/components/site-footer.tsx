import { Button } from "@webstore/ui";
import { env } from "@/env";

const columns = [
  { title: "Productos", items: ["Boxers", "Medias", "Camisetas", "Packs"] },
  { title: "Colecciones", items: ["Pima Esencial", "Diario", "Térmico", "Ofertas"] },
  { title: "Soporte", items: ["Contáctanos", "Cambios y devoluciones", "Guía de tallas", "Centro de ayuda"] },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface-inverse text-xs text-foreground-inverse-muted">
      <div className="mx-auto grid max-w-[88rem] gap-8 px-4 pt-11 pb-7 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xl font-extrabold text-foreground-inverse">
            <span aria-hidden="true" className="inline-block h-4 w-7 rounded-full border-[3px] border-foreground-inverse" />
            {env.NEXT_PUBLIC_STORE_NAME}
          </p>
          <p>Tienda de básicos creada para el día a día: boxers, medias y camisetas hechos para durar.</p>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-tile bg-surface-inverse-muted p-4">
            <p className="text-sm font-bold text-foreground-inverse">¿No quieres perderte ofertas?</p>
            <Button size="sm" variant="secondary" disabled>
              Suscribirme
            </Button>
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="mb-3 text-sm font-bold text-foreground-inverse">{column.title}</h2>
            <ul className="space-y-2">
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-[88rem] px-4 pb-6">
        © {new Date().getFullYear()} {env.NEXT_PUBLIC_STORE_NAME}
      </div>
    </footer>
  );
}
