"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { IconoBuscar, IconoCerrar } from "@/components/ui/ActionIcons";
import { SelectConFlecha } from "@/components/ui/SelectConFlecha";
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
    const params = new URLSearchParams(searchParams.toString());
    for (const campo of ["q", "sku"]) {
      const valor = String(formData.get(campo) ?? "").trim();
      if (valor) params.set(campo, valor);
      else params.delete(campo);
    }
    router.push(`/admin/productos?${params.toString()}`);
  }

  const hayFiltros = ["q", "sku", "categoria", "estado", "stock", "oferta", "destacado"].some((campo) => searchParams.get(campo));

  return (
    <form className={styles.filtros} onSubmit={onBuscar}>
      <div className={styles.filtrosPrimeraLinea}>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Buscar producto</span>
          <input className={styles.control} name="q" defaultValue={searchParams.get("q") ?? ""} placeholder="Nombre del producto" />
        </label>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>SKU</span>
          <input className={styles.control} name="sku" defaultValue={searchParams.get("sku") ?? ""} placeholder="Código SKU" />
        </label>
        <div className={styles.botones}>
          <button type="submit" className={styles.botonIcono} title="Buscar" aria-label="Buscar"><IconoBuscar /></button>
          {hayFiltros && <button type="button" className={styles.botonIcono} onClick={() => router.push("/admin/productos")} title="Limpiar filtros" aria-label="Limpiar filtros"><IconoCerrar /></button>}
        </div>
      </div>
      <div className={styles.filtrosSegundaLinea}>
        <label className={styles.campo}><span className={styles.etiqueta}>Categoría</span><SelectConFlecha className={styles.control} value={searchParams.get("categoria") ?? ""} onChange={(evento) => aplicar("categoria", evento.target.value)}><option value="">Todas</option>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}</SelectConFlecha></label>
        <label className={styles.campo}><span className={styles.etiqueta}>Estado</span><SelectConFlecha className={styles.control} value={searchParams.get("estado") ?? ""} onChange={(evento) => aplicar("estado", evento.target.value)}><option value="">Todos</option><option value="activo">Visibles</option><option value="inactivo">Ocultos</option></SelectConFlecha></label>
        <label className={styles.campo}><span className={styles.etiqueta}>Stock</span><SelectConFlecha className={styles.control} value={searchParams.get("stock") ?? ""} onChange={(evento) => aplicar("stock", evento.target.value)}><option value="">Todos</option><option value="disponible">Disponible</option><option value="bajo">Stock bajo</option><option value="agotado">Agotado</option></SelectConFlecha></label>
        <label className={styles.campo}><span className={styles.etiqueta}>Oferta</span><SelectConFlecha className={styles.control} value={searchParams.get("oferta") ?? ""} onChange={(evento) => aplicar("oferta", evento.target.value)}><option value="">Todos</option><option value="con">Con oferta</option><option value="sin">Sin oferta</option></SelectConFlecha></label>
      </div>
    </form>
  );
}
