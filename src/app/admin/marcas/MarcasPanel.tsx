"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarMarca, crearMarca, eliminarMarca } from "@/features/catalogo/actions/marcas";
import { slugificar } from "@/lib/utils";
import { IconoEditar, IconoEliminar } from "@/components/ui/ActionIcons";
import { CrudPanel } from "@/components/admin/CrudPanel";
import styles from "../admin.module.css";

type Fila = {
  id: string;
  nombre: string;
  slug: string;
  logoUrl: string | null;
  activo: boolean;
  productos: number;
};

const VACIA = { nombre: "", slug: "", logoUrl: "", activo: true };

export function MarcasPanel({ marcas }: { marcas: Fila[] }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(VACIA);
  const [slugManual, setSlugManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  function limpiar() {
    setEditandoId(null);
    setForm(VACIA);
    setSlugManual(false);
    setError(null);
    setMostrarFormulario(false);
  }

  function editar(marca: Fila) {
    setEditandoId(marca.id);
    setForm({
      nombre: marca.nombre,
      slug: marca.slug,
      logoUrl: marca.logoUrl ?? "",
      activo: marca.activo,
    });
    setSlugManual(true);
    setError(null);
    setMostrarFormulario(true);
  }

  function nuevaMarca() {
    limpiar();
    setMostrarFormulario(true);
  }

  function onSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);

    iniciarTransicion(async () => {
      const resultado = editandoId
        ? await actualizarMarca(editandoId, form)
        : await crearMarca(form);

      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }

      limpiar();
      router.refresh();
    });
  }

  function onEliminar(marca: Fila) {
    const aviso =
      marca.productos > 0
        ? `"${marca.nombre}" tiene ${marca.productos} producto(s); quedarán sin marca. ¿Continuar?`
        : `¿Eliminar la marca "${marca.nombre}"?`;
    if (!confirm(aviso)) return;

    setError(null);
    iniciarTransicion(async () => {
      const resultado = await eliminarMarca(marca.id);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      if (editandoId === marca.id) limpiar();
      router.refresh();
    });
  }

  return (
    <CrudPanel
      mostrarFormulario={mostrarFormulario}
      tituloFormulario={editandoId ? "Editar marca" : "Nueva marca"}
      tituloLista="Marcas existentes"
      etiquetaCrear="Crear marca"
      onCrear={nuevaMarca}
      onCancelar={limpiar}
      formulario={<form className={styles.form} onSubmit={onSubmit}>
          {error && <p className={styles.mensajeError}>{error}</p>}
          <div className={styles.fila}>
            <label className={styles.campo}><span className={styles.etiqueta}>Nombre</span><input className={styles.control} value={form.nombre} required onChange={(evento) => { const nombre = evento.target.value; setForm((previo) => ({ ...previo, nombre, slug: slugManual ? previo.slug : slugificar(nombre) })); }} /></label>
            <label className={styles.campo}><span className={styles.etiqueta}>Slug (URL)</span><input className={styles.control} value={form.slug} required onChange={(evento) => { setSlugManual(true); setForm((previo) => ({ ...previo, slug: evento.target.value })); }} /></label>
          </div>
          <label className={styles.campo}><span className={styles.etiqueta}>Logo (URL)</span><input className={styles.control} value={form.logoUrl} placeholder="https://..." onChange={(evento) => setForm((previo) => ({ ...previo, logoUrl: evento.target.value }))} /></label>
          <div className={`${styles.campo} ${styles.checkbox}`}><button type="button" className={`${styles.switch} ${form.activo ? styles.switchActivo : ""}`} role="switch" aria-checked={form.activo} onClick={() => setForm((previo) => ({ ...previo, activo: !previo.activo }))}><span className={styles.switchPunto} aria-hidden="true" /></button><span className={styles.etiqueta}>Visible en la tienda</span></div>
          <div className={styles.botones}><button type="submit" className={styles.boton} disabled={pendiente}>{pendiente ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear marca"}</button></div>
        </form>}
      lista={marcas.length === 0 ? (
        <p className={styles.vacio}>Todavía no hay marcas. Crea la primera con el botón anterior.</p>
      ) : (
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Productos</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {marcas.map((marca) => (
                <tr key={marca.id}>
                  <td>{marca.nombre}</td>
                  <td>{marca.slug}</td>
                  <td>{marca.productos}</td>
                  <td><span className={styles.badge}>{marca.activo ? "Visible" : "Oculta"}</span></td>
                  <td>
                    <div className={styles.acciones}>
                      <button type="button" className={styles.botonIcono} title="Editar" aria-label={`Editar ${marca.nombre}`} onClick={() => editar(marca)}><IconoEditar /></button>
                      <button type="button" className={styles.botonIcono} disabled={pendiente} title="Eliminar" aria-label={`Eliminar ${marca.nombre}`} onClick={() => onEliminar(marca)}><IconoEliminar /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    />
  );
}
