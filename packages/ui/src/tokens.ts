/** Única fuente de colores, espaciado y radios. Las páginas no definen estilos. */
export const tokens = {
  color: {
    fondo: "#ffffff",
    superficie: "#f8fafc",
    texto: "#0f172a",
    textoSuave: "#475569",
    primario: "#2563eb",
    primarioOscuro: "#1d4ed8",
    acento: "#f59e0b",
    borde: "#e2e8f0",
    sobrePrimario: "#ffffff",
  },
  espacio: { 1: "4px", 2: "8px", 3: "12px", 4: "16px", 6: "24px", 8: "32px", 12: "48px" },
  radio: { sm: "4px", md: "8px", lg: "12px" },
  fuente: {
    base: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    /** Bai Jamjuree se carga con next/font en el layout de cada app y expone esta variable. */
    logo: "var(--font-bai-jamjuree), system-ui, sans-serif",
  },
  tamano: { sm: "0.875rem", base: "1rem", lg: "1.25rem", xl: "1.5rem", "2xl": "2rem" },
  sombra: {
    sm: "0 1px 2px rgb(15 23 42 / 0.08)",
    md: "0 4px 12px rgb(15 23 42 / 0.12)",
  },
  ancho: { contenedor: "1200px" },
} as const;

/** Los media queries no aceptan variables CSS: se repiten en cada módulo (md y lg). */
export const quiebres = { md: "768px", lg: "1024px" } as const;
