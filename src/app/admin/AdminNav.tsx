"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  LayoutDashboard,
  Megaphone,
  Settings,
  Shirt,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import styles from "./admin.module.css";

const GRUPOS: {
  titulo: string | null;
  icono: LucideIcon | null;
  secciones: { href: string; etiqueta: string }[];
}[] = [
  {
    titulo: null, // "Panel" va suelto, sin encabezado de grupo ni desplegable
    icono: LayoutDashboard,
    secciones: [{ href: "/admin", etiqueta: "Panel" }],
  },
  {
    titulo: "Catálogo",
    icono: Shirt,
    secciones: [
      { href: "/admin/productos", etiqueta: "Productos" },
      { href: "/admin/categorias", etiqueta: "Categorías" },
      { href: "/admin/marcas", etiqueta: "Marcas" },
    ],
  },
  {
    titulo: "Inventario",
    icono: Boxes,
    secciones: [{ href: "/admin/stock", etiqueta: "Stock" }],
  },
  {
    titulo: "Ventas",
    icono: ShoppingCart,
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
    icono: Users,
    secciones: [{ href: "/admin/usuarios", etiqueta: "Clientes" }],
  },
  {
    titulo: "Marketing",
    icono: Megaphone,
    secciones: [{ href: "/admin/cupones", etiqueta: "Cupones" }],
  },
  {
    titulo: "Reportes",
    icono: BarChart3,
    secciones: [{ href: "/admin/reportes", etiqueta: "Ventas" }],
  },
  {
    titulo: "Configuración",
    icono: Settings,
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
                {Icono && <Icono size={14} className={styles.navGrupoIcono} aria-hidden="true" />}
                <span className={styles.navGrupoTexto}>{grupo.titulo}</span>
                <ChevronDown
                  size={14}
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
                  {Icono && <Icono size={16} className={styles.enlaceIcono} aria-hidden="true" />}
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
