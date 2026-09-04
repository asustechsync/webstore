"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./DateRangePicker.module.css";

export type RangoFechas = {
  desde: string;
  hasta: string;
};

type DateRangePickerProps = {
  value: RangoFechas;
  onChange: (rango: RangoFechas) => void;
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function fechaDesdeValor(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const [año, mes, dia] = valor.split("-").map(Number);
  const fecha = new Date(año, mes - 1, dia);
  return fecha.getFullYear() === año && fecha.getMonth() === mes - 1 && fecha.getDate() === dia ? fecha : null;
}

function iso(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function etiqueta(fecha: Date) {
  return `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;
}

function inicioDelDia(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export function DateRangePicker({ value, onChange, ariaLabel, placeholder = "Seleccionar fechas", disabled = false }: DateRangePickerProps) {
  const hoy = inicioDelDia(new Date());
  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState(hoy);
  const [borrador, setBorrador] = useState<RangoFechas>(value);
  const contenedor = useRef<HTMLDivElement>(null);

  const fechaDesde = fechaDesdeValor(value.desde);
  const fechaHasta = fechaDesdeValor(value.hasta);
  const borradorDesde = fechaDesdeValor(borrador.desde);
  const borradorHasta = fechaDesdeValor(borrador.hasta);

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

  const texto = fechaDesde && fechaHasta
    ? `${etiqueta(fechaDesde)} – ${etiqueta(fechaHasta)}`
    : fechaDesde
      ? `Desde ${etiqueta(fechaDesde)}`
      : placeholder;

  function alternar() {
    if (!abierto) {
      setBorrador(value);
      setVisible(fechaDesde ?? fechaHasta ?? hoy);
    }
    setAbierto((estado) => !estado);
  }

  function seleccionar(fecha: Date) {
    const valor = iso(fecha);

    if (!borradorDesde || borradorHasta) {
      setBorrador({ desde: valor, hasta: "" });
      return;
    }

    if (fecha.getTime() < borradorDesde.getTime()) {
      setBorrador({ desde: valor, hasta: iso(borradorDesde) });
      return;
    }

    setBorrador({ desde: borrador.desde, hasta: valor });
  }

  function aplicar() {
    if (!borradorDesde || !borradorHasta) return;
    onChange(borrador);
    setAbierto(false);
  }

  function borrar() {
    const vacio = { desde: "", hasta: "" };
    setBorrador(vacio);
    onChange(vacio);
    setAbierto(false);
  }

  function manejarTecla(evento: React.KeyboardEvent<HTMLElement>) {
    if (evento.key === "Escape") setAbierto(false);
  }

  return (
    <div ref={contenedor} className={styles.contenedor}>
      <button
        type="button"
        className={`${styles.control} ${abierto ? styles.controlAbierto : ""}`}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        disabled={disabled}
        onClick={alternar}
      >
        <svg className={styles.iconoCalendario} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" />
        </svg>
        <span className={fechaDesde ? undefined : styles.placeholder}>{texto}</span>
        <svg className={styles.flecha} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {abierto && (
        <section className={styles.calendario} role="dialog" aria-label={ariaLabel} onKeyDown={manejarTecla}>
          <header className={styles.cabecera}>
            <button type="button" aria-label="Mes anterior" onClick={() => setVisible((fecha) => new Date(fecha.getFullYear(), fecha.getMonth() - 1, 1))}>‹</button>
            <strong>{MESES[visible.getMonth()]} de {visible.getFullYear()}</strong>
            <button type="button" aria-label="Mes siguiente" onClick={() => setVisible((fecha) => new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1))}>›</button>
          </header>

          <div className={styles.diasSemana}>{DIAS.map((dia) => <span key={dia}>{dia}</span>)}</div>
          <div className={styles.dias}>
            {dias.map((dia) => {
              const tiempo = inicioDelDia(dia).getTime();
              const inicio = borradorDesde?.getTime();
              const fin = borradorHasta?.getTime();
              const esInicio = inicio === tiempo;
              const esFin = fin === tiempo;
              const estaEnRango = inicio !== undefined && fin !== undefined && tiempo > inicio && tiempo < fin;
              const esActual = dia.getMonth() === visible.getMonth();
              const esHoy = hoy.getTime() === tiempo;

              return (
                <button
                  key={iso(dia)}
                  type="button"
                  className={`${styles.dia} ${!esActual ? styles.diaFuera : ""} ${estaEnRango ? styles.diaEnRango : ""} ${esInicio ? styles.diaInicio : ""} ${esFin ? styles.diaFin : ""} ${esHoy ? styles.diaHoy : ""}`}
                  aria-label={dia.toLocaleDateString("es-PE", { dateStyle: "full" })}
                  aria-pressed={esInicio || esFin}
                  onClick={() => seleccionar(dia)}
                >
                  {dia.getDate()}
                </button>
              );
            })}
          </div>

          <footer className={styles.pie}>
            <button type="button" className={styles.botonBorrar} onClick={borrar}>Borrar</button>
            <button type="button" className={styles.botonAplicar} disabled={!borradorDesde || !borradorHasta} onClick={aplicar}>Aplicar</button>
          </footer>
        </section>
      )}
    </div>
  );
}
