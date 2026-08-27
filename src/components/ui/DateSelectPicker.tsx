"use client";

import { useState } from "react";
import { Select, type OpcionSelect } from "./Select";
import styles from "./DateSelectPicker.module.css";

type DateSelectPickerProps = {
  value: string;
  onChange: (valor: string) => void;
  ariaLabel: string;
  disabled?: boolean;
};

const MESES: OpcionSelect[] = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((etiqueta, indice) => ({ valor: String(indice), etiqueta }));
const AÑO_ACTUAL = new Date().getFullYear();
const AÑOS: OpcionSelect[] = Array.from({ length: AÑO_ACTUAL - 1899 }, (_, indice) => ({ valor: String(AÑO_ACTUAL - indice), etiqueta: String(AÑO_ACTUAL - indice) }));

function partesFecha(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return { dia: "", mes: "", año: "" };
  const [año, mes, dia] = valor.split("-");
  return { dia: String(Number(dia)), mes: String(Number(mes) - 1), año };
}

function diasDisponibles(año: string, mes: string): OpcionSelect[] {
  const maximo = año && mes !== "" ? new Date(Number(año), Number(mes) + 1, 0).getDate() : 31;
  return Array.from({ length: maximo }, (_, indice) => ({ valor: String(indice + 1), etiqueta: String(indice + 1).padStart(2, "0") }));
}

// Fecha reutilizable para formularios: elegir cada parte es más rápido que
// recorrer un calendario durante décadas para una fecha de nacimiento.
export function DateSelectPicker({ value, onChange, ariaLabel, disabled = false }: DateSelectPickerProps) {
  const inicial = partesFecha(value);
  const [dia, setDia] = useState(inicial.dia);
  const [mes, setMes] = useState(inicial.mes);
  const [año, setAño] = useState(inicial.año);
  const dias = diasDisponibles(año, mes);

  function actualizar(siguienteDia = dia, siguienteMes = mes, siguienteAño = año) {
    const maximo = siguienteAño && siguienteMes !== "" ? new Date(Number(siguienteAño), Number(siguienteMes) + 1, 0).getDate() : 31;
    const diaSeguro = siguienteDia && Number(siguienteDia) > maximo ? String(maximo) : siguienteDia;
    setDia(diaSeguro);
    setMes(siguienteMes);
    setAño(siguienteAño);
    onChange(diaSeguro && siguienteMes !== "" && siguienteAño ? `${siguienteAño}-${String(Number(siguienteMes) + 1).padStart(2, "0")}-${String(Number(diaSeguro)).padStart(2, "0")}` : "");
  }

  return <div className={styles.contenedor} role="group" aria-label={ariaLabel}>
    <Select value={dia} ariaLabel="Día" disabled={disabled} options={dias} placeholder="Día" onChange={(valor) => actualizar(valor, mes, año)} />
    <Select value={mes} ariaLabel="Mes" disabled={disabled} options={MESES} placeholder="Mes" onChange={(valor) => actualizar(dia, valor, año)} />
    <Select value={año} ariaLabel="Año" disabled={disabled} options={AÑOS} placeholder="Año" onChange={(valor) => actualizar(dia, mes, valor)} />
  </div>;
}
