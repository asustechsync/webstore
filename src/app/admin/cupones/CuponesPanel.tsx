"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  actualizarCupon,
  alternarActivoCupon,
  crearCupon,
  eliminarCupon,
} from "@/features/cupones/actions";
import { formatearPrecio } from "@/lib/utils";
import styles from "../admin.module.css";
import { IconoEditar, IconoEliminar } from "@/components/ui/ActionIcons";

type Fila = {
  id: string;
  codigo: string;
  tipo: "PORCENTAJE" | "MONTO_FIJO";
  valor: string;
  montoMinimo: string;
  usoMaximo: number | null;
  usosActuales: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
};

type FormCupon = {
  codigo: string;
  tipo: "PORCENTAJE" | "MONTO_FIJO";
  valor: string;
  montoMinimo: string;
  usoMaximo: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
};

const VACIA: FormCupon = {
  codigo: "",
  tipo: "PORCENTAJE",
  valor: "",
  montoMinimo: "",
  usoMaximo: "",
  fechaInicio: "",
  fechaFin: "",
  activo: true,
};

function estaVigente(fila: Fila) {
  const hoy = new Date().toISOString().slice(0, 10);
  if (fila.fechaInicio && hoy < fila.fechaInicio) return false;
  if (fila.fechaFin && hoy > fila.fechaFin) return false;
  if (fila.usoMaximo !== null && fila.usosActuales >= fila.usoMaximo) return false;
  return true;
}

export function CuponesPanel({ cupones }: { cupones: Fila[] }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormCupon>(VACIA);
  const [error, setError] = useState<string | null>(null);

  function limpiar() {
    setEditandoId(null);
    setForm(VACIA);
    setError(null);
  }

  function editar(cupon: Fila) {
    setEditandoId(cupon.id);
    setForm({
      codigo: cupon.codigo,
      tipo: cupon.tipo,
      valor: cupon.valor,
      montoMinimo: cupon.montoMinimo,
      usoMaximo: cupon.usoMaximo === null ? "" : String(cupon.usoMaximo),
      fechaInicio: cupon.fechaInicio,
      fechaFin: cupon.fechaFin,
      activo: cupon.activo,
    });
    setError(null);
  }

  function onSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);

    iniciarTransicion(async () => {
      const resultado = editandoId
        ? await actualizarCupon(editandoId, form)
        : await crearCupon(form);

      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }

      limpiar();
      router.refresh();
    });
  }

  function onEliminar(cupon: Fila) {
    if (!confirm(`¿Eliminar el cupón "${cupon.codigo}"?`)) return;

    setError(null);
    iniciarTransicion(async () => {
      const resultado = await eliminarCupon(cupon.id);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      if (editandoId === cupon.id) limpiar();
      router.refresh();
    });
  }

  function correr(accion: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await accion();
      if (!resultado.ok) setError(resultado.error ?? "Ocurrió un error");
      router.refresh();
    });
  }

  return (
    <>
      <section className={styles.seccion}>
        <h2 className={styles.titulo}>{editandoId ? "Editar cupón" : "Nuevo cupón"}</h2>

        <form className={styles.form} onSubmit={onSubmit}>
          {error && <p className={styles.mensajeError}>{error}</p>}

          <div className={styles.fila}>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Código</span>
              <input
                className={styles.control}
                value={form.codigo}
                placeholder="VERANO20"
                required
                onChange={(evento) =>
                  setForm((previo) => ({ ...previo, codigo: evento.target.value }))
                }
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Tipo</span>
              <select
                className={styles.control}
                value={form.tipo}
                onChange={(evento) =>
                  setForm((previo) => ({
                    ...previo,
                    tipo: evento.target.value as "PORCENTAJE" | "MONTO_FIJO",
                  }))
                }
              >
                <option value="PORCENTAJE">Porcentaje (%)</option>
                <option value="MONTO_FIJO">Monto fijo (S/)</option>
              </select>
            </label>
          </div>

          <div className={styles.fila}>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>
                Valor {form.tipo === "PORCENTAJE" ? "(%)" : "(S/)"}
              </span>
              <input
                className={styles.control}
                type="number"
                step="0.01"
                min="0"
                max={form.tipo === "PORCENTAJE" ? 100 : undefined}
                value={form.valor}
                required
                onChange={(evento) =>
                  setForm((previo) => ({ ...previo, valor: evento.target.value }))
                }
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Monto mínimo de compra (opcional)</span>
              <input
                className={styles.control}
                type="number"
                step="0.01"
                min="0"
                value={form.montoMinimo}
                onChange={(evento) =>
                  setForm((previo) => ({ ...previo, montoMinimo: evento.target.value }))
                }
              />
            </label>
          </div>

          <div className={styles.fila}>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Usos máximos (opcional)</span>
              <input
                className={styles.control}
                type="number"
                min="1"
                placeholder="Sin límite"
                value={form.usoMaximo}
                onChange={(evento) =>
                  setForm((previo) => ({ ...previo, usoMaximo: evento.target.value }))
                }
              />
            </label>
          </div>

          <div className={styles.fila}>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Vigente desde (opcional)</span>
              <input
                className={styles.control}
                type="date"
                value={form.fechaInicio}
                onChange={(evento) =>
                  setForm((previo) => ({ ...previo, fechaInicio: evento.target.value }))
                }
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Vigente hasta (opcional)</span>
              <input
                className={styles.control}
                type="date"
                value={form.fechaFin}
                onChange={(evento) =>
                  setForm((previo) => ({ ...previo, fechaFin: evento.target.value }))
                }
              />
            </label>
          </div>

          <div className={`${styles.campo} ${styles.checkbox}`}><button type="button" className={`${styles.switch} ${form.activo ? styles.switchActivo : ""}`} role="switch" aria-checked={form.activo} onClick={() => setForm((previo) => ({ ...previo, activo: !previo.activo }))}><span className={styles.switchPunto} aria-hidden="true" /></button><span className={styles.etiqueta}>Activo</span></div>

          <div className={styles.botones}>
            <button type="submit" className={styles.boton} disabled={pendiente}>
              {pendiente ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear cupón"}
            </button>
            {editandoId && (
              <button type="button" className={styles.botonSecundario} onClick={limpiar}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className={styles.titulo}>Cupones existentes</h2>

        {cupones.length === 0 ? (
          <p className={styles.vacio}>Todavía no hay cupones. Crea el primero arriba.</p>
        ) : (
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Mínimo de compra</th>
                  <th>Usos</th>
                  <th>Vigencia</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cupones.map((cupon) => (
                  <tr key={cupon.id}>
                    <td>{cupon.codigo}</td>
                    <td>
                      {cupon.tipo === "PORCENTAJE"
                        ? `${cupon.valor}%`
                        : formatearPrecio(cupon.valor)}
                    </td>
                    <td>{cupon.montoMinimo ? formatearPrecio(cupon.montoMinimo) : "-"}</td>
                    <td>
                      {cupon.usosActuales}
                      {cupon.usoMaximo !== null ? ` / ${cupon.usoMaximo}` : ""}
                    </td>
                    <td>
                      {cupon.fechaInicio || cupon.fechaFin
                        ? `${cupon.fechaInicio || "…"} → ${cupon.fechaFin || "…"}`
                        : "Sin límite"}
                    </td>
                    <td>
                      <span className={styles.badge}>
                        {!cupon.activo
                          ? "Desactivado"
                          : estaVigente(cupon)
                            ? "Vigente"
                            : "Fuera de vigencia"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.acciones}>
                        <button
                          type="button"
                          className={`${styles.switch} ${cupon.activo ? styles.switchActivo : ""}`}
                          disabled={pendiente}
                          role="switch"
                          aria-checked={cupon.activo}
                          aria-label={`${cupon.activo ? "Desactivar" : "Activar"} cupón ${cupon.codigo}`}
                          title={cupon.activo ? "Desactivar cupón" : "Activar cupón"}
                          onClick={() =>
                            correr(() => alternarActivoCupon(cupon.id, !cupon.activo))
                          }
                        >
                          <span className={styles.switchPunto} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={styles.botonIcono}
                          title="Editar"
                          aria-label={`Editar ${cupon.codigo}`}
                          onClick={() => editar(cupon)}
                        >
                          <IconoEditar />
                        </button>
                        <button
                          type="button"
                          className={styles.botonIcono}
                          disabled={pendiente}
                          title="Eliminar"
                          aria-label={`Eliminar ${cupon.codigo}`}
                          onClick={() => onEliminar(cupon)}
                        >
                          <IconoEliminar />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
