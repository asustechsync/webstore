"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./Select.module.css";

export type OpcionSelect = { valor: string; etiqueta: string; icono?: ReactNode };

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

// Sustituye el menú nativo para conservar la misma apariencia en todos los navegadores.
export function Select({ value, onChange, options, placeholder = "Selecciona una opción", ariaLabel, disabled = false, className, seleccionarAlEscribir = false, buscable = false }: SelectProps) {
  const [abierto, setAbierto] = useState(false);
  const [resaltada, setResaltada] = useState(value);
  const [termino, setTermino] = useState("");
  const contenedor = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const entradaBusqueda = useRef<HTMLInputElement>(null);
  const busqueda = useRef({ texto: "", momento: 0 });
  const listaId = useId();
  const seleccionada = options.find((opcion) => opcion.valor === value);
  const opcionesVisibles = buscable ? (termino.trim() ? options.filter((opcion) => `${opcion.etiqueta} ${opcion.valor}`.includes(termino.trim())) : []) : options;

  useEffect(() => {
    function cerrar(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
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

  return <div ref={contenedor} className={styles.contenedor} onKeyDown={manejarTecla}>
    <button type="button" className={`${styles.control} ${abierto ? styles.controlAbierto : ""} ${className ?? ""}`} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={abierto} aria-controls={listaId} disabled={disabled} onClick={() => setAbierto((estado) => !estado)}>
      <span className={`${styles.valor} ${seleccionada ? "" : styles.placeholder}`}>{seleccionada?.icono}{seleccionada?.etiqueta ?? placeholder}</span>
      <svg className={styles.flecha} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {abierto && <div ref={lista} id={listaId} className={styles.menu} role="listbox" aria-label={ariaLabel}>
      {buscable && <input ref={entradaBusqueda} className={styles.busqueda} value={termino} onChange={(evento) => setTermino(evento.target.value)} onKeyDown={(evento) => evento.stopPropagation()} placeholder="Número" aria-label={`Buscar ${ariaLabel.toLocaleLowerCase()}`} inputMode="tel" />}
      {opcionesVisibles.map((opcion) => <button key={opcion.valor} data-valor={opcion.valor} type="button" role="option" aria-selected={opcion.valor === value} className={opcion.valor === resaltada ? `${styles.opcion} ${styles.opcionActiva}` : styles.opcion} onClick={() => seleccionar(opcion.valor)}>{opcion.icono}{opcion.etiqueta}</button>)}
      {termino.trim() && opcionesVisibles.length === 0 && <p className={styles.sinResultados}>Sin datos</p>}
    </div>}
  </div>;
}
