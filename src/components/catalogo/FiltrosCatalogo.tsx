"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconoCerrar, IconoFiltros } from "@/components/ui/ActionIcons";
import { Select } from "@/components/ui/Select";
import {
  ORDENES,
  ORDEN_POR_DEFECTO,
  PARAMETROS,
  contarFiltrosActivos,
  type ClaveOrden,
  type FiltrosCatalogo as Filtros,
} from "@/features/catalogo/filtros";
import type { Facetas } from "@/features/catalogo/queries/productos";
import { formatearPrecio } from "@/lib/utils";
import styles from "./FiltrosCatalogo.module.css";

/** Dimensiones que una ruta puede fijar por sí misma (/categorias/[slug]). */
type Dimension = "categoria" | "marca";

type Props = {
  /** Ruta sin parámetros, a la que se le vuelven a colgar los filtros. */
  basePath: string;
  facetas: Facetas;
  /** Filtros ya normalizados por el servidor: el estado inicial del panel. */
  filtros: Filtros;
  /** Lo que impone la ruta no se muestra: no tendría sentido cambiarlo acá. */
  ocultar?: Dimension[];
};

const ETIQUETAS_MOVIL: Record<ClaveOrden, string> = {
  nuevo: "Novedades",
  "precio-asc": "Precio ↑",
  "precio-desc": "Precio ↓",
  nombre: "A-Z",
};

const CONSULTA_MOVIL = "(max-width: 47.99rem)";

export function FiltrosCatalogo({ basePath, facetas, filtros, ocultar = [] }: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);

  // El panel edita un borrador y solo navega al pulsar "Aplicar". En móvil eso
  // evita una recarga por cada toque, y en escritorio hace predecible cuándo
  // cambia la grilla.
  const clave = JSON.stringify(filtros);
  const [estado, setEstado] = useState({ clave, borrador: filtros });
  if (estado.clave !== clave) setEstado({ clave, borrador: filtros });
  const borrador = estado.borrador;

  const muestra = (dimension: Dimension) => !ocultar.includes(dimension);
  const activos = contarFiltrosActivos(filtros, {
    categoria: !muestra("categoria"),
    marca: !muestra("marca"),
  });

  // Con la hoja abierta el fondo no debe desplazarse; en escritorio el panel
  // es un bloque más de la página y no bloquea nada.
  useEffect(() => {
    if (!abierto || !window.matchMedia(CONSULTA_MOVIL).matches) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    function alPulsar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  function navegar(siguientes: Filtros) {
    const params = new URLSearchParams();
    if (muestra("categoria") && siguientes.categoria)
      params.set(PARAMETROS.categoria, siguientes.categoria);
    if (muestra("marca") && siguientes.marca) params.set(PARAMETROS.marca, siguientes.marca);
    for (const talla of siguientes.tallas) params.append(PARAMETROS.talla, talla);
    for (const color of siguientes.colores) params.append(PARAMETROS.color, color);
    if (siguientes.precioMin != null) params.set(PARAMETROS.precioMin, String(siguientes.precioMin));
    if (siguientes.precioMax != null) params.set(PARAMETROS.precioMax, String(siguientes.precioMax));
    if (siguientes.soloOfertas) params.set(PARAMETROS.ofertas, "1");
    if (siguientes.soloDisponibles) params.set(PARAMETROS.disponibles, "1");
    if (siguientes.orden !== ORDEN_POR_DEFECTO) params.set(PARAMETROS.orden, siguientes.orden);
    // La página se reinicia siempre: la 3 de un listado ya no es la 3 del otro.
    const consulta = params.toString();
    router.push(consulta ? `${basePath}?${consulta}` : basePath, { scroll: false });
  }

  function editar(cambios: Partial<Filtros>) {
    setEstado((previo) => ({ ...previo, borrador: { ...previo.borrador, ...cambios } }));
  }

  /** Quita un filtro desde su chip: es una sola acción, se aplica al instante. */
  function quitar(cambios: Partial<Filtros>) {
    navegar({ ...filtros, ...cambios });
  }

  function alternarEnLista(lista: string[], valor: string) {
    return lista.includes(valor) ? lista.filter((item) => item !== valor) : [...lista, valor];
  }

  const limpio: Filtros = {
    ...filtros,
    categoria: muestra("categoria") ? undefined : filtros.categoria,
    marca: muestra("marca") ? undefined : filtros.marca,
    tallas: [],
    colores: [],
    precioMin: undefined,
    precioMax: undefined,
    soloOfertas: false,
    soloDisponibles: false,
  };

  const chips = [
    ...(muestra("categoria") && filtros.categoria
      ? [
          {
            clave: `categoria-${filtros.categoria}`,
            texto:
              facetas.categorias.find((c) => c.slug === filtros.categoria)?.nombre ??
              filtros.categoria,
            quitar: () => quitar({ categoria: undefined }),
          },
        ]
      : []),
    ...(muestra("marca") && filtros.marca
      ? [
          {
            clave: `marca-${filtros.marca}`,
            texto: facetas.marcas.find((m) => m.slug === filtros.marca)?.nombre ?? filtros.marca,
            quitar: () => quitar({ marca: undefined }),
          },
        ]
      : []),
    ...filtros.tallas.map((talla) => ({
      clave: `talla-${talla}`,
      texto: `Talla ${talla}`,
      quitar: () => quitar({ tallas: filtros.tallas.filter((item) => item !== talla) }),
    })),
    ...filtros.colores.map((color) => ({
      clave: `color-${color}`,
      texto: color,
      quitar: () => quitar({ colores: filtros.colores.filter((item) => item !== color) }),
    })),
    ...(filtros.precioMin != null || filtros.precioMax != null
      ? [
          {
            clave: "precio",
            texto: describirRango(filtros.precioMin, filtros.precioMax),
            quitar: () => quitar({ precioMin: undefined, precioMax: undefined }),
          },
        ]
      : []),
    ...(filtros.soloOfertas
      ? [{ clave: "oferta", texto: "En oferta", quitar: () => quitar({ soloOfertas: false }) }]
      : []),
    ...(filtros.soloDisponibles
      ? [
          {
            clave: "disponible",
            texto: "Disponible",
            quitar: () => quitar({ soloDisponibles: false }),
          },
        ]
      : []),
  ];

  return (
    <div className={styles.contenedor}>
      <div className={styles.barra}>
        <button
          type="button"
          className={styles.botonFiltros}
          aria-expanded={abierto}
          aria-controls="panel-filtros"
          onClick={() => setAbierto((previo) => !previo)}
        >
          <IconoFiltros />
          Filtros
          {activos > 0 && <span className={styles.contador}>{activos}</span>}
        </button>

        {/* Select ocupa todo el ancho de su contenedor, así que la medida del
            control de orden se decide acá y no dentro del componente. */}
        <div className={styles.orden}>
          <Select
            value={filtros.orden}
            ariaLabel="Ordenar productos"
            options={Object.entries(ORDENES).map(([valor, { etiqueta }]) => ({
              valor,
              etiqueta,
              etiquetaMovil: ETIQUETAS_MOVIL[valor as ClaveOrden],
            }))}
            onChange={(valor) => navegar({ ...filtros, orden: valor as ClaveOrden })}
          />
        </div>
      </div>

      {chips.length > 0 && (
        <div className={styles.chipsActivos}>
          {chips.map((chip) => (
            <button
              key={chip.clave}
              type="button"
              className={styles.chipActivo}
              onClick={chip.quitar}
            >
              {chip.texto}
              <IconoCerrar />
              <span className={styles.soloLectores}>Quitar filtro</span>
            </button>
          ))}
          <button type="button" className={styles.limpiarTodo} onClick={() => navegar(limpio)}>
            Limpiar todo
          </button>
        </div>
      )}

      {abierto && (
        <>
          <div className={styles.fondo} onClick={() => setAbierto(false)} aria-hidden />
          <div id="panel-filtros" className={styles.panel}>
            <div className={styles.panelEncabezado}>
              <span className={styles.panelTitulo}>Filtros</span>
              <button
                type="button"
                className={styles.cerrar}
                onClick={() => setAbierto(false)}
                aria-label="Cerrar filtros"
              >
                <IconoCerrar />
              </button>
            </div>

            <div className={styles.grupos}>
              {muestra("categoria") && facetas.categorias.length > 1 && (
                <Grupo titulo="Categoría">
                  {facetas.categorias.map((categoria) => (
                    <Chip
                      key={categoria.slug}
                      activo={borrador.categoria === categoria.slug}
                      onClick={() =>
                        editar({
                          categoria:
                            borrador.categoria === categoria.slug ? undefined : categoria.slug,
                        })
                      }
                    >
                      {categoria.nombre}
                    </Chip>
                  ))}
                </Grupo>
              )}

              {muestra("marca") && facetas.marcas.length > 1 && (
                <Grupo titulo="Marca">
                  {facetas.marcas.map((marca) => (
                    <Chip
                      key={marca.slug}
                      activo={borrador.marca === marca.slug}
                      onClick={() =>
                        editar({ marca: borrador.marca === marca.slug ? undefined : marca.slug })
                      }
                    >
                      {marca.nombre}
                    </Chip>
                  ))}
                </Grupo>
              )}

              {facetas.tallas.length > 0 && (
                <Grupo titulo="Talla">
                  {facetas.tallas.map((talla) => (
                    <Chip
                      key={talla}
                      activo={borrador.tallas.includes(talla)}
                      onClick={() => editar({ tallas: alternarEnLista(borrador.tallas, talla) })}
                    >
                      {talla}
                    </Chip>
                  ))}
                </Grupo>
              )}

              {facetas.colores.length > 0 && (
                <Grupo titulo="Color">
                  {facetas.colores.map((color) => (
                    <Chip
                      key={color}
                      activo={borrador.colores.includes(color)}
                      onClick={() => editar({ colores: alternarEnLista(borrador.colores, color) })}
                    >
                      {color}
                    </Chip>
                  ))}
                </Grupo>
              )}

              <Grupo titulo="Precio">
                <div className={styles.rango}>
                  <label className={styles.campoRango}>
                    <span className={styles.soloLectores}>Precio desde</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className={styles.control}
                      placeholder={`Desde ${facetas.precioMin}`}
                      value={borrador.precioMin ?? ""}
                      onChange={(evento) =>
                        editar({ precioMin: aNumero(evento.currentTarget.value) })
                      }
                    />
                  </label>
                  <span className={styles.separadorRango} aria-hidden>
                    –
                  </span>
                  <label className={styles.campoRango}>
                    <span className={styles.soloLectores}>Precio hasta</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className={styles.control}
                      placeholder={`Hasta ${facetas.precioMax}`}
                      value={borrador.precioMax ?? ""}
                      onChange={(evento) =>
                        editar({ precioMax: aNumero(evento.currentTarget.value) })
                      }
                    />
                  </label>
                </div>
              </Grupo>

              <Grupo titulo="Mostrar">
                <Chip
                  activo={borrador.soloOfertas}
                  onClick={() => editar({ soloOfertas: !borrador.soloOfertas })}
                >
                  Solo ofertas
                </Chip>
                <Chip
                  activo={borrador.soloDisponibles}
                  onClick={() => editar({ soloDisponibles: !borrador.soloDisponibles })}
                >
                  Solo disponibles
                </Chip>
              </Grupo>
            </div>

            <div className={styles.panelPie}>
              <button
                type="button"
                className={styles.botonSecundario}
                onClick={() => {
                  setEstado((previo) => ({ ...previo, borrador: limpio }));
                }}
              >
                Limpiar
              </button>
              <button
                type="button"
                className={styles.botonPrimario}
                onClick={() => {
                  setAbierto(false);
                  navegar(borrador);
                }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className={styles.grupo}>
      <h2 className={styles.grupoTitulo}>{titulo}</h2>
      <div className={styles.chips}>{children}</div>
    </section>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={activo ? `${styles.chip} ${styles.chipSeleccionado}` : styles.chip}
      aria-pressed={activo}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function aNumero(valor: string): number | undefined {
  const numero = Number(valor);
  return valor.trim() !== "" && Number.isFinite(numero) && numero >= 0 ? numero : undefined;
}

function describirRango(minimo?: number, maximo?: number) {
  if (minimo != null && maximo != null)
    return `${formatearPrecio(minimo)} – ${formatearPrecio(maximo)}`;
  if (minimo != null) return `Desde ${formatearPrecio(minimo)}`;
  return `Hasta ${formatearPrecio(maximo ?? 0)}`;
}
