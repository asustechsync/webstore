"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Select.module.css";

export type OpcionSelect = { valor: string; etiqueta: string; etiquetaMovil?: string; icono?: ReactNode };

type SelectProps = {
  value: string;
  onChange: (valor: string) => void;
  options: OpcionSelect[];
  placeholder?: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  seleccionarAlEscribir?: boolean;
  buscable?: boolean;
};

/** Debe coincidir con `max-height` de `.menu` en Select.module.css. */
const ALTO_MAXIMO_MENU = 240;
const MARGEN_MENU = 4;

// Sustituye el menú nativo para conservar la misma apariencia en todos los navegadores.
export function Select({ value, onChange, options, placeholder = "Selecciona una opción", ariaLabel, disabled = false, className, seleccionarAlEscribir = false, buscable = false }: SelectProps) {
  const [abierto, setAbierto] = useState(false);
  const [resaltada, setResaltada] = useState(value);
  const [termino, setTermino] = useState("");
  const [posicion, setPosicion] = useState<{ top: number; left: number; width: number } | null>(null);
  const contenedor = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const entradaBusqueda = useRef<HTMLInputElement>(null);
  const busqueda = useRef({ texto: "", momento: 0 });
  const listaId = useId();
  const seleccionada = options.find((opcion) => opcion.valor === value);
  const opcionesVisibles = buscable ? (termino.trim() ? options.filter((opcion) => `${opcion.etiqueta} ${opcion.valor}`.includes(termino.trim())) : []) : options;

  useEffect(() => {
    function cerrar(evento: MouseEvent) {
      const objetivo = evento.target as Node;
      // El menú vive en un portal fuera de `contenedor` (así no lo recorta
      // ningún ancestro con scroll propio, como el contenedor de una tabla),
      // así que un clic dentro de él también cuenta como "dentro".
      if (!contenedor.current?.contains(objetivo) && !lista.current?.contains(objetivo)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  useEffect(() => {
    if (abierto && buscable) entradaBusqueda.current?.focus();
  }, [abierto, buscable]);

  useEffect(() => {
    if (!abierto || !resaltada) return;
    const opcion = Array.from(lista.current?.querySelectorAll<HTMLButtonElement>("[data-valor]") ?? [])
      .find((elemento) => elemento.dataset.valor === resaltada);
    opcion?.scrollIntoView({ block: "nearest" });
  }, [abierto, resaltada]);

  // Calcula dónde va el menú a partir del botón, no de su posición en el
  // documento: al vivir en un portal necesita coordenadas propias, y se
  // recalcula si la página (o un contenedor con scroll, como la tabla del
  // panel) se mueve mientras está abierto.
  useLayoutEffect(() => {
    if (!abierto) return;

    function actualizar() {
      const rect = contenedor.current?.getBoundingClientRect();
      if (!rect) return;
      const espacioAbajo = window.innerHeight - rect.bottom;
      // Si no entra hacia abajo pero sí hacia arriba, se abre hacia arriba;
      // así un select en la última fila de la tabla no queda tapado.
      const haciaArriba = espacioAbajo < ALTO_MAXIMO_MENU && rect.top > espacioAbajo;
      setPosicion({
        top: haciaArriba ? rect.top - MARGEN_MENU : rect.bottom + MARGEN_MENU,
        left: rect.left,
        width: rect.width,
      });
    }

    actualizar();
    // capture:true también escucha el scroll de contenedores internos
    // (la tabla del panel, por ejemplo), no solo el de la ventana.
    window.addEventListener("scroll", actualizar, true);
    window.addEventListener("resize", actualizar);
    return () => {
      window.removeEventListener("scroll", actualizar, true);
      window.removeEventListener("resize", actualizar);
    };
  }, [abierto]);

  function seleccionar(valor: string) {
    onChange(valor);
    setResaltada(valor);
    setTermino("");
    setAbierto(false);
  }

  function manejarTecla(evento: React.KeyboardEvent<HTMLDivElement>) {
    if (evento.key === "Escape") return setAbierto(false);
    if (evento.key === "Enter" && abierto) {
      evento.preventDefault();
      seleccionar(resaltada || value);
      return;
    }
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      setAbierto((estado) => {
        if (!estado) setResaltada(value);
        return !estado;
      });
      return;
    }
    if (evento.key.length === 1 && /\S/.test(evento.key)) {
      const ahora = Date.now();
      const texto = ahora - busqueda.current.momento < 700 ? `${busqueda.current.texto}${evento.key}` : evento.key;
      const normalizar = (valor: string) => valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
      const coincidencia = options.find((opcion) => normalizar(opcion.etiqueta).startsWith(normalizar(texto)));
      busqueda.current = { texto, momento: ahora };
      if (coincidencia) {
        evento.preventDefault();
        setResaltada(coincidencia.valor);
        if (seleccionarAlEscribir && options.some((opcion) => opcion.etiqueta === texto)) seleccionar(coincidencia.valor);
        else setAbierto(true);
      }
      return;
    }
    if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;
    evento.preventDefault();
    const indice = options.findIndex((opcion) => opcion.valor === (resaltada || value));
    const siguiente = evento.key === "ArrowDown" ? Math.min(indice + 1, options.length - 1) : Math.max(indice - 1, 0);
    setResaltada(options[siguiente].valor);
    setAbierto(true);
  }

  const menuAbierto = abierto && posicion;

  return <div ref={contenedor} className={styles.contenedor} onKeyDown={manejarTecla}>
    <button type="button" className={`${styles.control} ${abierto ? styles.controlAbierto : ""} ${className ?? ""}`} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={abierto} aria-controls={listaId} disabled={disabled} onClick={() => setAbierto((estado) => !estado)}>
      <span className={`${styles.valor} ${seleccionada ? "" : styles.placeholder}`}>{seleccionada?.icono}{seleccionada && <><span className={styles.etiquetaEscritorio}>{seleccionada.etiqueta}</span><span className={styles.etiquetaMovil}>{seleccionada.etiquetaMovil ?? seleccionada.etiqueta}</span></>}{!seleccionada && placeholder}</span>
      <svg className={styles.flecha} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {menuAbierto && createPortal(
      // En un portal a <body>: ningún `overflow: auto` de un ancestro (como
      // el envoltorio con scroll horizontal de las tablas del panel) lo
      // recorta ni le agrega una barra de scroll que desarme la tabla.
      <div ref={lista} id={listaId} className={styles.menu} role="listbox" aria-label={ariaLabel} style={{ top: posicion.top, left: posicion.left, width: posicion.width }}>
        {buscable && <input ref={entradaBusqueda} className={styles.busqueda} value={termino} onChange={(evento) => setTermino(evento.target.value)} onKeyDown={(evento) => evento.stopPropagation()} placeholder="Número" aria-label={`Buscar ${ariaLabel.toLocaleLowerCase()}`} inputMode="tel" />}
        {opcionesVisibles.map((opcion) => <button key={opcion.valor} data-valor={opcion.valor} type="button" role="option" aria-selected={opcion.valor === value} className={opcion.valor === resaltada ? `${styles.opcion} ${styles.opcionActiva}` : styles.opcion} onClick={() => seleccionar(opcion.valor)}>{opcion.icono}<span className={styles.etiquetaEscritorio}>{opcion.etiqueta}</span><span className={styles.etiquetaMovil}>{opcion.etiquetaMovil ?? opcion.etiqueta}</span></button>)}
        {termino.trim() && opcionesVisibles.length === 0 && <p className={styles.sinResultados}>Sin datos</p>}
      </div>,
      document.body,
    )}
  </div>;
}
