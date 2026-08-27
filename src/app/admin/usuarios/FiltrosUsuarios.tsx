"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "../admin.module.css";
import { SelectConFlecha } from "@/components/ui/SelectConFlecha";

type Rol = { id: string; nombre: string };

export function FiltrosUsuarios({ roles }: { roles: Rol[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function aplicar(campo: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(campo, valor);
    } else {
      params.delete(campo);
    }
    router.push(`/admin/usuarios?${params.toString()}`);
  }

  function onBuscar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData(evento.currentTarget);
    aplicar("q", String(formData.get("q") ?? "").trim());
  }

  const hayFiltros = ["q", "rol"].some((campo) => searchParams.get(campo));

  return (
    <form className={styles.filtros} onSubmit={onBuscar}>
      <label className={styles.campo}>
        <span className={styles.etiqueta}>Buscar</span>
        <input
          className={styles.control}
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Nombre o correo"
        />
      </label>

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Rol</span>
        <SelectConFlecha
          className={styles.control}
          value={searchParams.get("rol") ?? ""}
          onChange={(evento) => aplicar("rol", evento.target.value)}
        >
          <option value="">Todos</option>
          {roles.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {rol.nombre}
            </option>
          ))}
        </SelectConFlecha>
      </label>

      <div className={styles.botones}>
        <button type="submit" className={styles.botonSecundario}>
          Buscar
        </button>
        {hayFiltros && (
          <button
            type="button"
            className={styles.botonChico}
            onClick={() => router.push("/admin/usuarios")}
          >
            Limpiar
          </button>
        )}
      </div>
    </form>
  );
}
