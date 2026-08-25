"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ComponentType } from "react";
import { IconoFlecha, IconoFiltros } from "@/components/ui/ActionIcons";
import styles from "./admin.module.css";

const IconoTienda: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 640 640" width={size} height={size} className={className} focusable="false" {...props}>
    <path
      fill="currentColor"
      d="M53.5 245.1L110.3 131.4C121.2 109.7 143.3 96 167.6 96L472.5 96C496.7 96 518.9 109.7 529.7 131.4L586.5 245.1C590.1 252.3 592 260.2 592 268.3C592 295.6 570.8 318 544 319.9L544 512C544 529.7 529.7 544 512 544C494.3 544 480 529.7 480 512L480 320L384 320L384 496C384 522.5 362.5 544 336 544L144 544C117.5 544 96 522.5 96 496L96 319.9C69.2 318 48 295.6 48 268.3C48 260.3 49.9 252.3 53.5 245.1zM160 320L160 432C160 440.8 167.2 448 176 448L304 448C312.8 448 320 440.8 320 432L320 320L160 320z"
    />
  </svg>
);

const IconoInventario: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 640 640" width={size} height={size} className={className} focusable="false" {...props}>
    <path
      fill="currentColor"
      d="M288 64L288 128C288 136.8 295.2 144 304 144L336 144C344.8 144 352 136.8 352 128L352 64L384 64C419.3 64 448 92.7 448 128L448 256C448 261.5 447.3 266.9 446 272L194 272C192.7 266.9 192 261.5 192 256L192 128C192 92.7 220.7 64 256 64L288 64zM384 576C372.8 576 362.2 573.1 353 568C362.5 551.5 368 532.4 368 512L368 384C368 363.6 362.5 344.5 353 328C362.2 322.9 372.7 320 384 320L416 320L416 384C416 392.8 423.2 400 432 400L464 400C472.8 400 480 392.8 480 384L480 320L512 320C547.3 320 576 348.7 576 384L576 512C576 547.3 547.3 576 512 576L384 576zM64 384C64 348.7 92.7 320 128 320L160 320L160 384C160 392.8 167.2 400 176 400L208 400C216.8 400 224 392.8 224 384L224 320L256 320C291.3 320 320 348.7 320 384L320 512C320 547.3 291.3 576 256 576L128 576C92.7 576 64 547.3 64 512L64 384z"
    />
  </svg>
);

const IconoClientes: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 640 640" width={size} height={size} className={className} focusable="false" {...props}>
    <path
      fill="currentColor"
      d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z"
    />
  </svg>
);

const IconoReportes: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 640 640" width={size} height={size} className={className} focusable="false" {...props}>
    <path
      fill="currentColor"
      d="M128 128C128 110.3 113.7 96 96 96C78.3 96 64 110.3 64 128L64 464C64 508.2 99.8 544 144 544L544 544C561.7 544 576 529.7 576 512C576 494.3 561.7 480 544 480L144 480C135.2 480 128 472.8 128 464L128 128zM534.6 214.6C547.1 202.1 547.1 181.8 534.6 169.3C522.1 156.8 501.8 156.8 489.3 169.3L384 274.7L326.6 217.4C314.1 204.9 293.8 204.9 281.3 217.4L185.3 313.4C172.8 325.9 172.8 346.2 185.3 358.7C197.8 371.2 218.1 371.2 230.6 358.7L304 285.3L361.4 342.7C373.9 355.2 394.2 355.2 406.7 342.7L534.7 214.7z"
    />
  </svg>
);

const IconoConfiguracion: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> = ({ size = 14, className, ...props }) => (
  <svg viewBox="0 0 640 640" width={size} height={size} className={className} focusable="false" {...props}>
    <path
      fill="currentColor"
      d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z"
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

const GRUPOS: {
  titulo: string | null;
  icono: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }> | null;
  secciones: { href: string; etiqueta: string }[];
}[] = [
  {
    titulo: null, // "Panel" va suelto, sin encabezado de grupo ni desplegable
    icono: IconoFiltros,
    secciones: [{ href: "/admin", etiqueta: "Panel" }],
  },
  {
    titulo: "Tienda",
    icono: IconoTienda,
    secciones: [
      { href: "/admin/productos", etiqueta: "Productos" },
      { href: "/admin/categorias", etiqueta: "Categorías" },
      { href: "/admin/marcas", etiqueta: "Marcas" },
    ],
  },
  {
    titulo: "Inventario",
    icono: IconoInventario,
    secciones: [{ href: "/admin/stock", etiqueta: "Stock" }],
  },
  {
    titulo: "Ventas",
    icono: IconoVentas,
    secciones: [
      { href: "/admin/pedidos", etiqueta: "Pedidos" },
      { href: "/admin/envios", etiqueta: "Envíos" },
      { href: "/admin/facturacion", etiqueta: "Facturación" },
    ],
  },
  {
    // Apunta a Usuarios porque todavía no existe una página separada de
    // clientes; hoy es la misma tabla con filtro por rol.
    titulo: "Clientes",
    icono: IconoClientes,
    secciones: [{ href: "/admin/usuarios", etiqueta: "Clientes" }],
  },
  {
    titulo: "Marketing",
    icono: IconoMarketing,
    secciones: [{ href: "/admin/cupones", etiqueta: "Cupones" }],
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
      { href: "/admin/cuenta", etiqueta: "Cuenta" },
    ],
  },
];

function esActivo(pathname: string, href: string) {
  // "/admin" solo marca activo en la ruta exacta; el resto también en sus subrutas.
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function grupoDeLaRuta(pathname: string) {
  return GRUPOS.find(
    (grupo) => grupo.titulo && grupo.secciones.some((seccion) => esActivo(pathname, seccion.href)),
  )?.titulo;
}

export function AdminNav() {
  const pathname = usePathname();
  const [abiertos, setAbiertos] = useState<Set<string>>(() => {
    const activo = grupoDeLaRuta(pathname);
    return new Set(activo ? [activo] : []);
  });
  // Compara contra el pathname del render anterior (patrón recomendado por
  // React para "ajustar estado" sin useEffect: ver
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [pathnamePrevio, setPathnamePrevio] = useState(pathname);

  if (pathname !== pathnamePrevio) {
    setPathnamePrevio(pathname);
    // Al navegar a otra sección, su grupo se abre solo (sin cerrar los que el
    // usuario ya haya abierto a mano).
    const activo = grupoDeLaRuta(pathname);
    if (activo && !abiertos.has(activo)) {
      setAbiertos(new Set(abiertos).add(activo));
    }
  }

  function alternarGrupo(titulo: string) {
    setAbiertos((previo) => {
      const siguiente = new Set(previo);
      if (siguiente.has(titulo)) {
        siguiente.delete(titulo);
      } else {
        siguiente.add(titulo);
      }
      return siguiente;
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
                      className={`${styles.enlace} ${esActivo(pathname, seccion.href) ? styles.enlaceActivo : ""}`}
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
                  className={`${styles.enlace} ${esActivo(pathname, seccion.href) ? styles.enlaceActivo : ""}`}
                >
                  {Icono && <Icono size={18} className={`${styles.enlaceIcono} ${indice === 0 ? styles.enlaceIconoPanel : ""}`} aria-hidden={true} />}
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
