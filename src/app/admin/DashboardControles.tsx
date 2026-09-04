"use client";

import { useState } from "react";
import { DateRangePicker, type RangoFechas } from "@/components/ui/DateRangePicker";
import { Select } from "@/components/ui/Select";
import styles from "./admin.module.css";

const PERIODOS = [
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "7d", etiqueta: "Últimos 7 días" },
  { valor: "30d", etiqueta: "Últimos 30 días" },
  { valor: "mes", etiqueta: "Este mes" },
  { valor: "personalizado", etiqueta: "Personalizado" },
];

function iso(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function rangoDelPeriodo(periodo: string): RangoFechas {
  const hasta = new Date();
  const desde = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());

  if (periodo === "7d") desde.setDate(desde.getDate() - 6);
  if (periodo === "30d") desde.setDate(desde.getDate() - 29);
  if (periodo === "mes") desde.setDate(1);

  return { desde: iso(desde), hasta: iso(hasta) };
}

export function DashboardControles() {
  const [periodo, setPeriodo] = useState("7d");
  const [rango, setRango] = useState<RangoFechas>(() => rangoDelPeriodo("7d"));

  function cambiarPeriodo(nuevoPeriodo: string) {
    setPeriodo(nuevoPeriodo);
    if (nuevoPeriodo !== "personalizado") setRango(rangoDelPeriodo(nuevoPeriodo));
  }

  function cambiarRango(nuevoRango: RangoFechas) {
    setRango(nuevoRango);
    setPeriodo("personalizado");
  }

  return (
    <div className={styles.dashboardControles}>
      <div className={styles.dashboardRango} role="group" aria-label="Rango de fechas">
        <DateRangePicker value={rango} onChange={cambiarRango} ariaLabel="Rango de fechas del dashboard" />
      </div>
      <div className={styles.dashboardPeriodo}>
        <Select value={periodo} onChange={cambiarPeriodo} options={PERIODOS} ariaLabel="Periodo del dashboard" />
      </div>
    </div>
  );
}
