"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "../admin.module.css";

export function FiltroFechas() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData(evento.currentTarget);
    const params = new URLSearchParams();
    const desde = String(formData.get("desde") ?? "");
    const hasta = String(formData.get("hasta") ?? "");
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    router.push(`/admin/reportes?${params.toString()}`);
  }

  return (
    <form className={styles.filtros} onSubmit={onSubmit}>
      <label className={styles.campo}>
        <span className={styles.etiqueta}>Desde</span>
        <input
          className={styles.control}
          type="date"
          name="desde"
          defaultValue={searchParams.get("desde") ?? ""}
        />
      </label>

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Hasta</span>
        <input
          className={styles.control}
          type="date"
          name="hasta"
          defaultValue={searchParams.get("hasta") ?? ""}
        />
      </label>

      <div className={styles.botones}>
        <button type="submit" className={styles.botonSecundario}>
          Aplicar
        </button>
      </div>
    </form>
  );
}
