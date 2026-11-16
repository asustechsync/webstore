import type { GarmentKind } from "@/lib/sample-products";

/**
 * Prenda dibujada en SVG, tintada con el color del producto.
 * Es un sustituto hasta tener fotos reales (Supabase Storage).
 */
export function Garment({ kind, color, className }: { kind: GarmentKind; color: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-hidden="true" className={className} style={{ color }}>
      {kind === "boxer" && (
        <>
          <path d="M10 26H90L88 62Q74 86 54 86L50 66L46 86Q26 86 12 62Z" fill="currentColor" />
          <rect x="10" y="14" width="80" height="13" rx="4" fill="currentColor" opacity=".78" />
        </>
      )}
      {kind === "sock" && (
        <>
          <path d="M34 6H62V50L84 64Q95 73 88 84Q80 93 64 87L34 66Z" fill="currentColor" />
          <rect x="34" y="6" width="28" height="12" fill="currentColor" opacity=".78" />
          <path d="M34 22H62" stroke="rgba(255,255,255,.55)" strokeWidth="3" />
        </>
      )}
      {kind === "tee" && <path d="M34 10Q50 22 66 10L92 24L82 42L72 38V90H28V38L18 42L8 24Z" fill="currentColor" />}
    </svg>
  );
}
