"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  actualizarAtributoCatalogo,
  crearAtributoCatalogo,
  eliminarAtributoCatalogo,
} from "@/features/catalogo/actions/atributos";
import { slugificar } from "@/lib/utils";
import { IconoBuscar, IconoEditar, IconoEliminar } from "@/components/ui/ActionIcons";
import { SelectConFlecha } from "@/components/ui/SelectConFlecha";
import { CrudPanel } from "@/components/admin/CrudPanel";
import styles from "../admin.module.css";

type TipoAtributo = "LISTA" | "COLOR";
type Fila = {
  id: string;
  nombre: string;
  clave: string;
  tipo: TipoAtributo;
  activo: boolean;
  valores: string[];
};

type Formulario = { nombre: string; clave: string; tipo: TipoAtributo; valores: string; activo: boolean };
const VACIO: Formulario = { nombre: "", clave: "", tipo: "LISTA", valores: "", activo: true };

function aValores(texto: string) {
  return texto
    .split(/[\n,]/)
    .map((valor) => valor.trim())
    .filter(Boolean);
}

export function AtributosPanel({ atributos }: { atributos: Fila[] }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [claveManual, setClaveManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  function limpiar() {
    setForm(VACIO);
    setEditandoId(null);
    setClaveManual(false);
    setError(null);
    setMostrarFormulario(false);
  }

  function editar(atributo: Fila) {
    setForm({
      nombre: atributo.nombre,
      clave: atributo.clave,
      tipo: atributo.tipo,
      valores: atributo.valores.join(", "),
      activo: atributo.activo,
    });
    setEditandoId(atributo.id);
    setClaveManual(true);
    setError(null);
    setMostrarFormulario(true);
  }

  function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);
    const datos = { ...form, clave: form.clave.replaceAll("-", "_"), valores: aValores(form.valores) };

    iniciarTransicion(async () => {
      const resultado = editandoId
        ? await actualizarAtributoCatalogo(editandoId, datos)
        : await crearAtributoCatalogo(datos);
      if (!resultado.ok) return setError(resultado.error);
      limpiar();
      router.refresh();
    });
  }

  function eliminar(atributo: Fila) {
    if (!confirm(`¿Eliminar el atributo "${atributo.nombre}"?`)) return;
    iniciarTransicion(async () => {
      const resultado = await eliminarAtributoCatalogo(atributo.id);
      if (!resultado.ok) return setError(resultado.error);
      if (editandoId === atributo.id) limpiar();
      router.refresh();
    });
  }

  return (
    <CrudPanel
      mostrarFormulario={mostrarFormulario}
      tituloFormulario={editandoId ? "Editar atributo" : "Nuevo atributo"}
      tituloLista="Atributos registrados"
      etiquetaCrear="Crear atributo"
      onCrear={() => { limpiar(); setMostrarFormulario(true); }}
      onCancelar={limpiar}
      formulario={<form className={styles.form} onSubmit={guardar}>
          {error && <p className={styles.mensajeError}>{error}</p>}
          <div className={styles.fila}>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Nombre</span>
              <input className={styles.control} required value={form.nombre} onChange={(evento) => {
                const nombre = evento.target.value;
                setForm((previo) => ({ ...previo, nombre, clave: claveManual ? previo.clave : slugificar(nombre).replaceAll("-", "_") }));
              }} />
            </label>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Clave interna</span>
              <input className={styles.control} required value={form.clave} placeholder="talla" onChange={(evento) => {
                setClaveManual(true);
                setForm((previo) => ({ ...previo, clave: evento.target.value }));
              }} />
            </label>
          </div>
          <div className={styles.fila}>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Tipo</span>
              <SelectConFlecha className={styles.control} value={form.tipo} onChange={(evento) => setForm((previo) => ({ ...previo, tipo: evento.target.value as TipoAtributo }))}>
                <option value="LISTA">Lista de valores</option>
                <option value="COLOR">Color</option>
              </SelectConFlecha>
            </label>
            <div className={`${styles.campo} ${styles.checkbox}`}>
              <button type="button" className={`${styles.switch} ${form.activo ? styles.switchActivo : ""}`} role="switch" aria-checked={form.activo} onClick={() => setForm((previo) => ({ ...previo, activo: !previo.activo }))}><span className={styles.switchPunto} aria-hidden="true" /></button>
              <span className={styles.etiqueta}>Disponible para productos</span>
            </div>
          </div>
          {editandoId && <div className={styles.fila}><p className={styles.bloqueAyuda}>Los valores se administran desde la pantalla propia del atributo, uno por uno.</p><Link href={`/admin/atributos/${editandoId}`} className={styles.botonSecundario}>Abrir valores de {form.nombre}</Link></div>}
          <div className={styles.botones}>
            <button type="submit" className={styles.boton} disabled={pendiente}>{pendiente ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear atributo"}</button>
            {editandoId && <button type="button" className={styles.botonSecundario} onClick={limpiar}>Cancelar</button>}
          </div>
        </form>}
      lista={atributos.length === 0 ? <p className={styles.vacio}>Crea un atributo para reutilizarlo en tus productos.</p> : (
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead><tr><th>Nombre</th><th>Valores</th><th>Estado</th><th /></tr></thead>
              <tbody>{atributos.map((atributo) => <tr key={atributo.id}>
                <td><Link href={`/admin/atributos/${atributo.id}`} className={styles.enlace}><strong>{atributo.nombre}</strong></Link></td><td>{atributo.valores.length}</td><td><span className={styles.badge}>{atributo.activo ? "Disponible" : "Oculto"}</span></td>
                <td><div className={styles.acciones}><Link href={`/admin/atributos/${atributo.id}`} className={styles.botonIcono} title={`Ver valores de ${atributo.nombre}`} aria-label={`Ver valores de ${atributo.nombre}`}><IconoBuscar /></Link><button type="button" className={styles.botonIcono} title="Editar atributo" aria-label={`Editar ${atributo.nombre}`} onClick={() => editar(atributo)}><IconoEditar /></button><button type="button" className={styles.botonIcono} title="Eliminar" aria-label={`Eliminar ${atributo.nombre}`} disabled={pendiente} onClick={() => eliminar(atributo)}><IconoEliminar /></button></div></td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
    />
  );
}
