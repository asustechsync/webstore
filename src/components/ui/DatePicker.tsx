"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./DatePicker.module.css";

type DatePickerProps = {
  value: string;
  onChange: (valor: string) => void;
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function fechaDesdeValor(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const [año, mes, dia] = valor.split("-").map(Number);
  return new Date(año, mes - 1, dia);
}

function iso(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function etiqueta(fecha: Date) {
  return `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;
}

// Calendario reutilizable: evita las diferencias visuales del input date nativo.
export function DatePicker({ value, onChange, ariaLabel, placeholder = "dd/mm/aaaa", disabled = false }: DatePickerProps) {
  const elegida = fechaDesdeValor(value);
  const hoy = new Date();
  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState(() => elegida ?? hoy);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function cerrar(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const dias = useMemo(() => {
    const inicio = new Date(visible.getFullYear(), visible.getMonth(), 1);
    const primerDia = (inicio.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, indice) => new Date(visible.getFullYear(), visible.getMonth(), indice - primerDia + 1));
  }, [visible]);

  function seleccionar(fecha: Date) {
    onChange(iso(fecha));
    setAbierto(false);
  }

  return <div ref={contenedor} className={styles.contenedor}>
    <button type="button" className={`${styles.control} ${abierto ? styles.controlAbierto : ""}`} aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={abierto} disabled={disabled} onClick={() => { if (!abierto) setVisible(elegida ?? hoy); setAbierto((estado) => !estado); }}>
      <span className={elegida ? undefined : styles.placeholder}>{elegida ? etiqueta(elegida) : placeholder}</span>
      <svg className={styles.iconoCalendario} viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" /></svg>
    </button>
    {abierto && <section className={styles.calendario} role="dialog" aria-label={ariaLabel}>
      <header className={styles.cabecera}>
        <button type="button" aria-label="Mes anterior" onClick={() => setVisible((fecha) => new Date(fecha.getFullYear(), fecha.getMonth() - 1, 1))}>‹</button>
        <strong>{MESES[visible.getMonth()]} de {visible.getFullYear()}</strong>
        <button type="button" aria-label="Mes siguiente" onClick={() => setVisible((fecha) => new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1))}>›</button>
      </header>
      <div className={styles.diasSemana}>{DIAS.map((dia) => <span key={dia}>{dia}</span>)}</div>
      <div className={styles.dias}>{dias.map((dia) => {
        const esActual = dia.getMonth() === visible.getMonth();
        const esElegida = elegida?.toDateString() === dia.toDateString();
        const esHoy = hoy.toDateString() === dia.toDateString();
        return <button key={iso(dia)} type="button" className={`${styles.dia} ${!esActual ? styles.diaFuera : ""} ${esElegida ? styles.diaElegido : ""} ${esHoy ? styles.diaHoy : ""}`} aria-label={dia.toLocaleDateString("es-PE", { dateStyle: "full" })} aria-pressed={esElegida} onClick={() => seleccionar(dia)}>{dia.getDate()}</button>;
      })}</div>
      <footer className={styles.pie}><button type="button" onClick={() => onChange("")}>Borrar</button><button type="button" onClick={() => seleccionar(hoy)}>Hoy</button></footer>
    </section>}
  </div>;
}
