"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconoEditar, IconoEliminar } from "@/components/ui/ActionIcons";
import { Select } from "@/components/ui/Select";
import { eliminarMiDireccion, guardarMiDireccion } from "@/features/usuarios/cuenta-actions";
import { useUbigeo } from "@/components/ubicaciones/useUbigeo";
import styles from "../cuenta.module.css";

type Direccion = { id: string; departamento: string; provincia: string; distrito: string; direccion: string; codigoPostal: string; referencia: string; predeterminada: boolean };
const VACIA = { departamento: "", provincia: "", distrito: "", direccion: "", codigoPostal: "", referencia: "", predeterminada: false };

export function DireccionesPanel({ direcciones }: { direcciones: Direccion[] }) {
  const router = useRouter();
  const [mostrar, setMostrar] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(VACIA);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  function nueva() { setEditandoId(null); setForm(VACIA); setError(null); setMostrar(true); }
  function editar(d: Direccion) { setEditandoId(d.id); setForm({ ...d, codigoPostal: d.codigoPostal || "", referencia: d.referencia || "" }); setError(null); setMostrar(true); }
  function cancelar() { setMostrar(false); setEditandoId(null); setError(null); }
  function cambiar(campo: keyof typeof VACIA, valor: string | boolean) { setForm((p) => ({ ...p, [campo]: valor })); }
  // Mismo hook que el checkout: los distritos se descargan al elegir provincia.
  const { departamentos, departamento, provincia, provinciasDisponibles, distritosDisponibles, cargandoProvincias, cargandoDistritos } = useUbigeo(form.departamento, form.provincia);
  function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    iniciarTransicion(async () => {
      const resultado = await guardarMiDireccion(editandoId, form);
      if (!resultado.ok) return setError(resultado.error);
      cancelar(); router.refresh();
    });
  }
  function eliminar(id: string) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    iniciarTransicion(async () => { const resultado = await eliminarMiDireccion(id); if (!resultado.ok) return setError(resultado.error); router.refresh(); });
  }

  return <>
    <div className={styles.seccionCabecera}><div><h2 className={styles.titulo}>Mis direcciones</h2><p className={styles.descripcion}>Gestiona tus entregas.</p></div></div>
    {error && !mostrar && <p className={styles.mensajeError}>{error}</p>}
    {mostrar && <form className={`${styles.formulario} ${styles.formularioDireccion}`} onSubmit={onSubmit}>
      <div className={styles.formularioTitulo}><h3>{editandoId ? "Editar dirección" : "Nueva dirección"}</h3></div>
      {error && <p className={styles.mensajeError}>{error}</p>}
      <div className={styles.formGrid}>
        <label className={styles.campo}><span>Dirección</span><input required placeholder="Av., calle, número, interior" value={form.direccion} onChange={(e) => cambiar("direccion", e.target.value)} /></label>
        <label className={styles.campo}><span>Referencia (opcional)</span><input value={form.referencia} onChange={(e) => cambiar("referencia", e.target.value)} /></label>
        <div className={styles.campo}><span>Departamento</span><Select value={departamento ? String(departamento.id) : ""} placeholder="Selecciona departamento" ariaLabel="Departamento" options={departamentos.map((item) => ({ valor: String(item.id), etiqueta: item.departamento }))} onChange={(valor) => { const seleccionado = departamentos.find((item) => String(item.id) === valor); cambiar("departamento", seleccionado?.departamento ?? ""); cambiar("provincia", ""); cambiar("distrito", ""); }} /></div>
        <div className={styles.campo}><span>Provincia</span><Select value={provincia ? String(provincia.id) : ""} placeholder="Selecciona provincia" ariaLabel="Provincia" disabled={!departamento || cargandoProvincias} options={provinciasDisponibles.map((item) => ({ valor: String(item.id), etiqueta: item.provincia }))} onChange={(valor) => { const seleccionado = provinciasDisponibles.find((item) => String(item.id) === valor); cambiar("provincia", seleccionado?.provincia ?? ""); cambiar("distrito", ""); }} /></div>
        <div className={styles.campo}><span>Distrito</span><Select value={distritosDisponibles.find((item) => item.distrito === form.distrito) ? String(distritosDisponibles.find((item) => item.distrito === form.distrito)?.id) : ""} placeholder="Selecciona distrito" ariaLabel="Distrito" disabled={!provincia || cargandoDistritos} options={distritosDisponibles.map((item) => ({ valor: String(item.id), etiqueta: item.distrito }))} onChange={(valor) => { const seleccionado = distritosDisponibles.find((item) => String(item.id) === valor); cambiar("distrito", seleccionado?.distrito ?? ""); }} /></div>
        <label className={styles.campo}><span>Código postal (opcional)</span><input value={form.codigoPostal} maxLength={20} inputMode="numeric" onChange={(e) => cambiar("codigoPostal", e.target.value.replace(/\D/g, ""))} /></label>
      </div>
      <label className={styles.check}><input type="checkbox" checked={form.predeterminada} onChange={(e) => cambiar("predeterminada", e.target.checked)} /> Usar como principal</label>
      <div className={styles.accionesDireccion}><button className={styles.botonPrimario} type="submit" disabled={pendiente}>{pendiente ? "Guardando..." : "Guardar dirección"}</button><button className={styles.botonSecundario} type="button" onClick={cancelar}>Cancelar</button></div>
    </form>}
    {direcciones.length ? <div className={styles.direcciones}>{direcciones.map((d) => <article className={styles.direccion} key={d.id}><div className={styles.direccionCabecera}><div>{d.predeterminada && <span className={styles.etiqueta}>Predeterminada</span>}<h3>{d.distrito}, {d.provincia}</h3></div><div className={styles.iconos}><button type="button" onClick={() => editar(d)} aria-label="Editar dirección"><IconoEditar /></button><button type="button" onClick={() => eliminar(d.id)} aria-label="Eliminar dirección"><IconoEliminar /></button></div></div><p>{d.direccion}{d.referencia ? ` · ${d.referencia}` : ""}</p><p>{d.distrito}, {d.provincia}, {d.departamento}</p></article>)}<button type="button" className={styles.botonSecundario} onClick={nueva}>Añadir dirección</button></div> : !mostrar && <div className={styles.estadoVacio}><strong>Aún no tienes direcciones</strong><p>Agrega una para completar tus compras más rápido.</p><button type="button" className={styles.botonSecundario} onClick={nueva}>Añadir dirección</button></div>}
  </>;
}
