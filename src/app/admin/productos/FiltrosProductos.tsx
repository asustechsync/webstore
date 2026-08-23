"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "../admin.module.css";

type Opcion = { id: string; nombre: string };

export function FiltrosProductos({ categorias }: { categorias: Opcion[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function aplicar(campo: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(campo, valor);
    } else {
      params.delete(campo);
    }
    router.push(`/admin/productos?${params.toString()}`);
  }

  function onBuscar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData(evento.currentTarget);
    aplicar("q", String(formData.get("q") ?? "").trim());
  }

  const hayFiltros = ["q", "categoria", "estado"].some((campo) => searchParams.get(campo));

  return (
    <form className={styles.filtros} onSubmit={onBuscar}>
      <label className={styles.campo}>
        <span className={styles.etiqueta}>Buscar</span>
        <input
          className={styles.control}
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Nombre o SKU"
        />
      </label>

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Categoría</span>
        <select
          className={styles.control}
          value={searchParams.get("categoria") ?? ""}
          onChange={(evento) => aplicar("categoria", evento.target.value)}
        >
          <option value="">Todas</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Estado</span>
        <select
          className={styles.control}
          value={searchParams.get("estado") ?? ""}
          onChange={(evento) => aplicar("estado", evento.target.value)}
        >
          <option value="">Todos</option>
          <option value="activo">Visibles</option>
          <option value="inactivo">Ocultos</option>
          <option value="bajo">Stock bajo</option>
        </select>
      </label>

      <div className={styles.botones}>
        <button type="submit" className={styles.botonSecundario}>
          Buscar
        </button>
        {hayFiltros && (
          <button
            type="button"
            className={styles.botonChico}
            onClick={() => router.push("/admin/productos")}
          >
            Limpiar
          </button>
        )}
      </div>
    </form>
  );
}
