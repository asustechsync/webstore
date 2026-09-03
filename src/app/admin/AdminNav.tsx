"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { ComponentType } from "react";
import { IconoFlecha } from "@/components/ui/ActionIcons";
import styles from "./admin.module.css";

// Ícono inline de tienda para compatibilidad con vistas antiguas.
const IconoTienda: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} focusable="false" {...props}>
    <g clipPath="url(#clip0_4418_7218)">
      <path
        fill="currentColor"
        d="M14.7 22.7507H9.30001C4.36001 22.7507 2.26001 20.6407 2.26001 15.7107V11.2207C2.26001 10.8107 2.60001 10.4707 3.01001 10.4707C3.42001 10.4707 3.76001 10.8107 3.76001 11.2207V15.7107C3.76001 19.8007 5.21001 21.2507 9.30001 21.2507H14.69C18.78 21.2507 20.23 19.8007 20.23 15.7107V11.2207C20.23 10.8107 20.57 10.4707 20.98 10.4707C21.39 10.4707 21.73 10.8107 21.73 11.2207V15.7107C21.74 20.6407 19.63 22.7507 14.7 22.7507Z"
      />
      <path
        fill="currentColor"
        d="M12 12.75C10.9 12.75 9.9 12.32 9.19 11.53C8.48 10.74 8.15 9.71 8.26 8.61L8.93 1.93C8.97 1.55 9.29 1.25 9.68 1.25H14.35C14.74 1.25 15.06 1.54 15.1 1.93L15.77 8.61C15.88 9.71 15.55 10.74 14.84 11.53C14.1 12.32 13.1 12.75 12 12.75ZM10.35 2.75L9.75 8.76C9.68 9.43 9.88 10.06 10.3 10.52C11.15 11.46 12.85 11.46 13.7 10.52C14.12 10.05 14.32 9.42 14.25 8.76L13.65 2.75H10.35Z"
      />
      <path
        fill="currentColor"
        d="M18.31 12.75C16.28 12.75 14.47 11.11 14.26 9.09L13.56 2.08C13.54 1.87 13.61 1.66 13.75 1.5C13.89 1.34 14.09 1.25 14.31 1.25H17.36C20.3 1.25 21.67 2.48 22.08 5.5L22.36 8.28C22.48 9.46 22.12 10.58 21.35 11.43C20.58 12.28 19.5 12.75 18.31 12.75ZM15.14 2.75L15.76 8.94C15.89 10.19 17.05 11.25 18.31 11.25C19.07 11.25 19.75 10.96 20.24 10.43C20.72 9.9 20.94 9.19 20.87 8.43L20.59 5.68C20.28 3.42 19.55 2.75 17.36 2.75H15.14Z"
      />
      <path
        fill="currentColor"
        d="M5.64002 12.75C4.45002 12.75 3.37002 12.28 2.60002 11.43C1.83002 10.58 1.47002 9.46 1.59002 8.28L1.86002 5.53C2.28002 2.48 3.65002 1.25 6.59002 1.25H9.64002C9.85002 1.25 10.05 1.34 10.2 1.5C10.35 1.66 10.41 1.87 10.39 2.08L9.69002 9.09C9.48002 11.11 7.67002 12.75 5.64002 12.75ZM6.59002 2.75C4.40002 2.75 3.67002 3.41 3.35002 5.7L3.08002 8.43C3.00002 9.19 3.23002 9.9 3.71002 10.43C4.19002 10.96 4.87002 11.25 5.64002 11.25C6.90002 11.25 8.07002 10.19 8.19002 8.94L8.81002 2.75H6.59002Z"
      />
      <path
        fill="currentColor"
        d="M14.5 22.75H9.5C9.09 22.75 8.75 22.41 8.75 22V19.5C8.75 17.4 9.9 16.25 12 16.25C14.1 16.25 15.25 17.4 15.25 19.5V22C15.25 22.41 14.91 22.75 14.5 22.75ZM10.25 21.25H13.75V19.5C13.75 18.24 13.26 17.75 12 17.75C10.74 17.75 10.25 18.24 10.25 19.5V21.25Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_4418_7218">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// Ícono de box para Inventario (public/icons/iconsax/box.svg).
const IconoInventario: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className} focusable="false" {...props}>
    <path
      d="M3.17004 7.43945 12 12.5494l8.77-5.07998M12 21.6091v-9.07M9.92999 2.48 4.59 5.45003C3.38 6.12003 2.39001 7.80001 2.39001 9.18001v5.64999c0 1.38.98999 3.06 2.19999 3.73l5.34 2.97c1.14.63 3.01.63 4.15 0l5.34-2.97c1.21-.67 2.2-2.35 2.2-3.73V9.18001c0-1.38-.99-3.06-2.2-3.72998L14.08 2.48c-1.15-.64-3.01-.64-4.15 0ZM17 13.2396V9.57965L7.51001 4.09961"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Ícono inline de gráfico para compatibilidad con vistas antiguas.
const IconoReportes: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} focusable="false" {...props}>
    <g clipPath="url(#clip0_4418_7623)">
      <path
        fill="currentColor"
        d="M22 22.75H2C1.59 22.75 1.25 22.41 1.25 22C1.25 21.59 1.59 21.25 2 21.25H22C22.41 21.25 22.75 21.59 22.75 22C22.75 22.41 22.41 22.75 22 22.75Z"
      />
      <path
        fill="currentColor"
        d="M14.25 22.75H9.75C9.34 22.75 9 22.41 9 22V4C9 2.28 9.95 1.25 11.55 1.25H12.45C14.05 1.25 15 2.28 15 4V22C15 22.41 14.66 22.75 14.25 22.75ZM10.5 21.25H13.5V4C13.5 2.85 12.96 2.75 12.45 2.75H11.55C11.04 2.75 10.5 2.85 10.5 4V21.25Z"
      />
      <path
        fill="currentColor"
        d="M7 22.75H3C2.59 22.75 2.25 22.41 2.25 22V10C2.25 8.28 3.13 7.25 4.6 7.25H5.4C6.87 7.25 7.75 8.28 7.75 10V22C7.75 22.41 7.41 22.75 7 22.75ZM3.75 21.25H6.25V10C6.25 8.75 5.7 8.75 5.4 8.75H4.6C4.3 8.75 3.75 8.75 3.75 10V21.25Z"
      />
      <path
        fill="currentColor"
        d="M21 22.75H17C16.59 22.75 16.25 22.41 16.25 22V15C16.25 13.28 17.13 12.25 18.6 12.25H19.4C20.87 12.25 21.75 13.28 21.75 15V22C21.75 22.41 21.41 22.75 21 22.75ZM17.75 21.25H20.25V15C20.25 13.75 19.7 13.75 19.4 13.75H18.6C18.3 13.75 17.75 13.75 17.75 15V21.25Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_4418_7623">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// Mismo ícono de engranaje que ya usa "Configuración" en la cuenta del
// cliente (public/icons/iconsax/setting.svg), para que ambas secciones se
// lean igual. Es de trazo (stroke), no de relleno como el resto de íconos
// de este archivo, por eso el stroke usa currentColor en vez del fill.
const IconoConfiguracion: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className} focusable="false" {...props}>
    <path
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
    />
    <path
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2 12.8794v-1.76c0-1.04.85-1.9 1.9-1.9 1.81 0 2.55-1.28 1.64-2.85-.52-.9-.21-2.07.7-2.59l1.73-.99c.79-.47 1.81-.19 2.28.6l.11.19c.9 1.57 2.38 1.57 3.29 0l.11-.19c.47-.79 1.49-1.07 2.28-.6l1.73.99c.91.52 1.22 1.69.7 2.59-.91 1.57-.17 2.85 1.64 2.85 1.04 0 1.9.85 1.9 1.9v1.76c0 1.04-.85 1.9-1.9 1.9-1.81 0-2.55 1.28-1.64 2.85.52.91.21 2.07-.7 2.59l-1.73.99c-.79.47-1.81.19-2.28-.6l-.11-.19c-.9-1.57-2.38-1.57-3.29 0l-.11.19c-.47.79-1.49 1.07-2.28.6l-1.73-.99c-.91-.52-1.22-1.69-.7-2.59.91-1.57.17-2.85-1.64-2.85-1.05 0-1.9-.86-1.9-1.9Z"
    />
  </svg>
);

const IconoVentas: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 640 640" width={size} height={size} className={className} focusable="false" {...props}>
    <path
      fill="currentColor"
      d="M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z"
    />
  </svg>
);

const IconoMarketing: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 640 640" width={size} height={size} className={className} focusable="false" {...props}>
    <path
      fill="currentColor"
      d="M525.2 82.9C536.7 88 544 99.4 544 112L544 528C544 540.6 536.7 552 525.2 557.1C513.7 562.2 500.4 560.3 490.9 552L444.3 511.3C400.7 473.2 345.6 451 287.9 448.3L287.9 544C287.9 561.7 273.6 576 255.9 576L223.9 576C206.2 576 191.9 561.7 191.9 544L191.9 448C121.3 448 64 390.7 64 320C64 249.3 121.3 192 192 192L276.5 192C338.3 191.8 397.9 169.3 444.4 128.7L491 88C500.4 79.7 513.9 77.8 525.3 82.9zM288 384L288 384.2C358.3 386.9 425.8 412.7 480 457.6L480 182.3C425.8 227.2 358.3 253 288 255.7L288 384z"
    />
  </svg>
);

const IconoEnvios: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 640 640" width={size} height={size} className={className} focusable="false" {...props}>
    <path fill="currentColor" d="M64 96C46.3 96 32 110.3 32 128L32 416C32 433.7 46.3 448 64 448L96 448C96 501 139 544 192 544C245 544 288 501 288 448L384 448C384 501 427 544 480 544C533 544 576 501 576 448L608 448L608 320C608 302.3 593.7 288 576 288L480 288L420.2 168.4C414.8 157.6 403.8 150.7 391.7 150.7L320 150.7L320 128C320 110.3 305.7 96 288 96L64 96zM384 214.7L420.6 288L352 288L352 214.7L384 214.7zM192 416C209.7 416 224 430.3 224 448C224 465.7 209.7 480 192 480C174.3 480 160 465.7 160 448C160 430.3 174.3 416 192 416zM480 416C497.7 416 512 430.3 512 448C512 465.7 497.7 480 480 480C462.3 480 448 465.7 448 448C448 430.3 462.3 416 480 416z" />
  </svg>
);

// Ícono de grid 2x2 para el panel de inicio (Inicio).
const IconoGrid: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} focusable="false" {...props}>
    <g clipPath="url(#clip0_4418_7182)">
      <path
        fill="currentColor"
        d="M19.77 13.75H15.73C13.72 13.75 12.75 12.82 12.75 10.9V4.1C12.75 2.18 13.73 1.25 15.73 1.25H19.77C21.78 1.25 22.75 2.18 22.75 4.1V10.9C22.75 12.82 21.77 13.75 19.77 13.75ZM15.73 2.75C14.46 2.75 14.25 3.09 14.25 4.1V10.9C14.25 11.91 14.46 12.25 15.73 12.25H19.77C21.04 12.25 21.25 11.91 21.25 10.9V4.1C21.25 3.09 21.04 2.75 19.77 2.75H15.73Z"
      />
      <path
        fill="currentColor"
        d="M19.77 22.75H15.73C13.72 22.75 12.75 21.82 12.75 19.9V18.1C12.75 16.18 13.73 15.25 15.73 15.25H19.77C21.78 15.25 22.75 16.18 22.75 18.1V19.9C22.75 21.82 21.77 22.75 19.77 22.75ZM15.73 16.75C14.46 16.75 14.25 17.09 14.25 18.1V19.9C14.25 20.91 14.46 21.25 15.73 21.25H19.77C21.04 21.25 21.25 20.91 21.25 19.9V18.1C21.25 17.09 21.04 16.75 19.77 16.75H15.73Z"
      />
      <path
        fill="currentColor"
        d="M8.27 22.75H4.23C2.22 22.75 1.25 21.82 1.25 19.9V13.1C1.25 11.18 2.23 10.25 4.23 10.25H8.27C10.28 10.25 11.25 11.18 11.25 13.1V19.9C11.25 21.82 10.27 22.75 8.27 22.75ZM4.23 11.75C2.96 11.75 2.75 12.09 2.75 13.1V19.9C2.75 20.91 2.96 21.25 4.23 21.25H8.27C9.54 21.25 9.75 20.91 9.75 19.9V13.1C9.75 12.09 9.54 11.75 8.27 11.75H4.23Z"
      />
      <path
        fill="currentColor"
        d="M8.27 8.75H4.23C2.22 8.75 1.25 7.82 1.25 5.9V4.1C1.25 2.18 2.23 1.25 4.23 1.25H8.27C10.28 1.25 11.25 2.18 11.25 4.1V5.9C11.25 7.82 10.27 8.75 8.27 8.75ZM4.23 2.75C2.96 2.75 2.75 3.09 2.75 4.1V5.9C2.75 6.91 2.96 7.25 4.23 7.25H8.27C9.54 7.25 9.75 6.91 9.75 5.9V4.1C9.75 3.09 9.54 2.75 8.27 2.75H4.23Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_4418_7182">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// Se conservan disponibles para otras vistas que puedan reutilizar estos
// iconos; Catálogo y Promociones usan ahora los recursos solicitados.
void IconoTienda;
void IconoMarketing;
void IconoVentas;
void IconoEnvios;

const IconoCarpeta: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 16, className, ...props }) => (
  <span className={`${className} ${styles.navIconoCarpeta}`} style={{ width: size, height: size }} {...props} />
);

const IconoBolsaVentas: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 16, className, ...props }) => (
  <span className={`${className} ${styles.navIconoBolsaVentas}`} style={{ width: size, height: size }} {...props} />
);

const IconoEtiqueta: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 16, className, ...props }) => (
  <span className={`${className} ${styles.navIconoEtiqueta}`} style={{ width: size, height: size }} {...props} />
);

const IconoNota: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 16, className, ...props }) => (
  <span className={`${className} ${styles.navIconoNota}`} style={{ width: size, height: size }} {...props} />
);

const IconoCamion: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 16, className, ...props }) => (
  <span className={`${className} ${styles.navIconoCamion}`} style={{ width: size, height: size }} {...props} />
);

const GRUPOS: {
  titulo: string | null;
  icono: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> | null;
  secciones: { href: string; etiqueta: string }[];
}[] = [
  {
    titulo: null, // Inicio va suelto, sin encabezado de grupo ni desplegable.
    icono: IconoGrid,
    secciones: [{ href: "/admin", etiqueta: "Inicio" }],
  },
  {
    titulo: "Ventas",
    icono: IconoBolsaVentas,
    secciones: [
      { href: "/admin/pedidos", etiqueta: "Pedidos" },
      { href: "/admin/clientes", etiqueta: "Clientes" },
      { href: "/admin/facturacion", etiqueta: "Facturación" },
    ],
  },
  {
    titulo: "Catálogo",
    icono: IconoNota,
    secciones: [
      { href: "/admin/productos", etiqueta: "Productos" },
      { href: "/admin/categorias", etiqueta: "Categorías" },
      { href: "/admin/atributos", etiqueta: "Atributos" },
      { href: "/admin/marcas", etiqueta: "Marcas" },
    ],
  },
  {
    titulo: "Inventario",
    icono: IconoInventario,
    secciones: [
      { href: "/admin/stock", etiqueta: "Stock" },
      { href: "/admin/stock?filtro=alertas", etiqueta: "Alertas" },
    ],
  },
  {
    titulo: "Promociones",
    icono: IconoEtiqueta,
    secciones: [
      { href: "/admin/cupones", etiqueta: "Cupones" },
      { href: "/admin/productos?destacado=si", etiqueta: "Destacados" },
    ],
  },
  {
    titulo: "Envíos",
    icono: IconoCamion,
    secciones: [{ href: "/admin/envios", etiqueta: "Seguimiento" }],
  },
  {
    titulo: "Reportes",
    icono: IconoReportes,
    secciones: [{ href: "/admin/reportes", etiqueta: "Ventas" }],
  },
  {
    titulo: "Configuración",
    icono: IconoConfiguracion,
    secciones: [
      { href: "/admin/usuarios", etiqueta: "Usuarios" },
      { href: "/admin/cuenta", etiqueta: "Mi cuenta" },
    ],
  },
];

type ParametrosRuta = { get(nombre: string): string | null };

function separarHref(href: string) {
  const [ruta, consulta = ""] = href.split("?");
  return { ruta, parametros: new URLSearchParams(consulta) };
}

function coincideRuta(pathname: string, href: string, parametrosActuales: ParametrosRuta) {
  const { ruta, parametros } = separarHref(href);
  const coincidePath = ruta === "/admin" ? pathname === ruta : pathname.startsWith(ruta);
  return coincidePath && [...parametros].every(([nombre, valor]) => parametrosActuales.get(nombre) === valor);
}

function esActivo(pathname: string, href: string, parametrosActuales: ParametrosRuta) {
  if (!coincideRuta(pathname, href, parametrosActuales)) return false;
  const { ruta, parametros } = separarHref(href);
  if ([...parametros].length > 0) return true;

  // Una opción con filtros específicos (por ejemplo, Destacados) tiene
  // prioridad visual sobre el enlace genérico de la misma página (Productos).
  return !GRUPOS.some((grupo) =>
    grupo.secciones.some((seccion) => {
      const destino = separarHref(seccion.href);
      return destino.ruta === ruta && [...destino.parametros].length > 0 && coincideRuta(pathname, seccion.href, parametrosActuales);
    }),
  );
}

function grupoDeLaRuta(pathname: string, parametrosActuales: ParametrosRuta) {
  return GRUPOS.find(
    (grupo) => grupo.titulo && grupo.secciones.some((seccion) => esActivo(pathname, seccion.href, parametrosActuales)),
  )?.titulo;
}

export function AdminNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const claveRuta = `${pathname}?${searchParams.toString()}`;
  const [abiertos, setAbiertos] = useState<Set<string>>(() => {
    const activo = grupoDeLaRuta(pathname, searchParams);
    return new Set(activo ? [activo] : []);
  });
  // Compara contra el pathname del render anterior (patrón recomendado por
  // React para "ajustar estado" sin useEffect: ver
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [rutaPrevia, setRutaPrevia] = useState(claveRuta);

  if (claveRuta !== rutaPrevia) {
    setRutaPrevia(claveRuta);
    // El menú es un acordeón: al navegar queda abierto únicamente el grupo
    // que contiene la pantalla actual.
    const activo = grupoDeLaRuta(pathname, searchParams);
    setAbiertos(new Set(activo ? [activo] : []));
  }

  function alternarGrupo(titulo: string) {
    setAbiertos((previo) => {
      // Abrir un grupo repliega cualquier otro; si ya estaba abierto, se cierra.
      return previo.has(titulo) ? new Set() : new Set([titulo]);
    });
  }

  return (
    <nav className={styles.nav}>
      {GRUPOS.map((grupo, indice) => {
        const Icono = grupo.icono;
        const abierto = grupo.titulo ? abiertos.has(grupo.titulo) : true;

        return (
          <div key={grupo.titulo ?? `suelto-${indice}`} className={styles.navGrupo}>
            {grupo.titulo && (
              <button
                type="button"
                className={styles.navGrupoTitulo}
                aria-expanded={abierto}
                onClick={() => alternarGrupo(grupo.titulo!)}
              >
                  {Icono && <Icono className={styles.navGrupoIcono} aria-hidden={true} />}
                <span className={styles.navGrupoTexto}>{grupo.titulo}</span>
                <IconoFlecha
                  className={`${styles.navGrupoChevron} ${abierto ? styles.navGrupoChevronAbierto : ""}`}
                  aria-hidden="true"
                />
              </button>
            )}
            {grupo.titulo ? (
              // El colapso (con transición) solo existe en el sidebar de
              // escritorio; en móvil este envoltorio no hace nada especial
              // y todas las opciones quedan siempre visibles en la fila de
              // píldoras (ver admin.module.css).
              <div
                className={`${styles.navSubgrupo} ${abierto ? styles.navSubgrupoAbierto : ""}`}
              >
                <div className={styles.navSubgrupoInner}>
                  {grupo.secciones.map((seccion) => (
                    <Link
                      key={seccion.href}
                      href={seccion.href}
                      className={`${styles.enlace} ${esActivo(pathname, seccion.href, searchParams) ? styles.enlaceActivo : ""}`}
                    >
                      {seccion.etiqueta}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              grupo.secciones.map((seccion) => (
                <Link
                  key={seccion.href}
                  href={seccion.href}
                  className={`${styles.enlace} ${esActivo(pathname, seccion.href, searchParams) ? styles.enlaceActivo : ""}`}
                >
                  {Icono && <Icono className={`${styles.enlaceIcono} ${indice === 0 ? styles.enlaceIconoPanel : ""}`} aria-hidden={true} />}
                  {seccion.etiqueta}
                </Link>
              ))
            )}
          </div>
        );
      })}
    </nav>
  );
}
