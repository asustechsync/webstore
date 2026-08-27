"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconoEditar, IconoEliminar } from "@/components/ui/ActionIcons";
import { eliminarMiDireccion, guardarMiDireccion } from "@/features/usuarios/cuenta-actions";
import styles from "../cuenta.module.css";

type Direccion = { id: string; destinatario: string; telefono: string; departamento: string; provincia: string; distrito: string; direccion: string; referencia: string; predeterminada: boolean };
const VACIA = { destinatario: "", telefono: "", departamento: "", provincia: "", distrito: "", direccion: "", referencia: "", predeterminada: false };

export function DireccionesPanel({ direcciones }: { direcciones: Direccion[] }) {
  const router = useRouter();
  const [mostrar, setMostrar] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(VACIA);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  function nueva() { setEditandoId(null); setForm(VACIA); setError(null); setMostrar(true); }
  function editar(d: Direccion) { setEditandoId(d.id); setForm({ ...d, referencia: d.referencia || "" }); setError(null); setMostrar(true); }
  function cancelar() { setMostrar(false); setEditandoId(null); setError(null); }
  function cambiar(campo: keyof typeof VACIA, valor: string | boolean) { setForm((p) => ({ ...p, [campo]: valor })); }
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
    <div className={styles.seccionCabecera}><div><h2 className={styles.titulo}>Mis direcciones</h2><p className={styles.descripcion}>Administra dónde quieres recibir tus compras.</p></div><button type="button" className={styles.botonPrimario} onClick={nueva}>Nueva dirección</button></div>
    {error && !mostrar && <p className={styles.mensajeError}>{error}</p>}
    {mostrar && <form className={`${styles.formulario} ${styles.formularioDireccion}`} onSubmit={onSubmit}>
      <div className={styles.formularioTitulo}><h3>{editandoId ? "Editar dirección" : "Nueva dirección"}</h3><button type="button" className={styles.botonTexto} onClick={cancelar}>Cancelar</button></div>
      {error && <p className={styles.mensajeError}>{error}</p>}
      <div className={styles.formGrid}>
        <label className={styles.campo}><span>Persona que recibe</span><input required value={form.destinatario} onChange={(e) => cambiar("destinatario", e.target.value)} /></label>
        <label className={styles.campo}><span>Teléfono</span><input required inputMode="tel" value={form.telefono} onChange={(e) => cambiar("telefono", e.target.value)} /></label>
        <label className={styles.campo}><span>Departamento</span><input required value={form.departamento} onChange={(e) => cambiar("departamento", e.target.value)} /></label>
        <label className={styles.campo}><span>Provincia</span><input required value={form.provincia} onChange={(e) => cambiar("provincia", e.target.value)} /></label>
        <label className={styles.campo}><span>Distrito</span><input required value={form.distrito} onChange={(e) => cambiar("distrito", e.target.value)} /></label>
        <label className={`${styles.campo} ${styles.campoAncho}`}><span>Dirección</span><input required placeholder="Av., calle, número, interior" value={form.direccion} onChange={(e) => cambiar("direccion", e.target.value)} /></label>
        <label className={`${styles.campo} ${styles.campoAncho}`}><span>Referencia (opcional)</span><input value={form.referencia} onChange={(e) => cambiar("referencia", e.target.value)} /></label>
      </div>
      <label className={styles.check}><input type="checkbox" checked={form.predeterminada} onChange={(e) => cambiar("predeterminada", e.target.checked)} /> Usar como dirección predeterminada</label>
      <button className={styles.botonPrimario} type="submit" disabled={pendiente}>{pendiente ? "Guardando..." : "Guardar dirección"}</button>
    </form>}
    {direcciones.length ? <div className={styles.direcciones}>{direcciones.map((d) => <article className={styles.direccion} key={d.id}><div className={styles.direccionCabecera}><div>{d.predeterminada && <span className={styles.etiqueta}>Predeterminada</span>}<h3>{d.destinatario}</h3></div><div className={styles.iconos}><button type="button" onClick={() => editar(d)} aria-label="Editar dirección"><IconoEditar /></button><button type="button" onClick={() => eliminar(d.id)} aria-label="Eliminar dirección"><IconoEliminar /></button></div></div><p>{d.direccion}{d.referencia ? ` · ${d.referencia}` : ""}</p><p>{d.distrito}, {d.provincia}, {d.departamento}</p><p>{d.telefono}</p></article>)}</div> : !mostrar && <div className={styles.estadoVacio}><strong>Aún no tienes direcciones</strong><p>Agrega una para completar tus compras más rápido.</p><button type="button" className={styles.botonSecundario} onClick={nueva}>Agregar mi primera dirección</button></div>}
  </>;
}
