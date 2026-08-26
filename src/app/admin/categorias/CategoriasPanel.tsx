"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
} from "@/features/catalogo/actions";
import { slugificar } from "@/lib/utils";
import styles from "../admin.module.css";
import { IconoEditar, IconoEliminar } from "@/components/ui/ActionIcons";

type Fila = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  orden: number;
  destacada: boolean;
  tituloSeo: string | null;
  descripcionSeo: string | null;
  padreId: string | null;
  activo: boolean;
  productos: number;
};

const VACIA = {
  nombre: "",
  slug: "",
  descripcion: "",
  imagenUrl: "",
  orden: 0,
  destacada: false,
  tituloSeo: "",
  descripcionSeo: "",
  padreId: "",
  activo: true,
};

export function CategoriasPanel({ categorias }: { categorias: Fila[] }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(VACIA);
  const [slugManual, setSlugManual] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function limpiar() {
    setEditandoId(null);
    setForm(VACIA);
    setSlugManual(false);
    setError(null);
  }

  function editar(categoria: Fila) {
    setEditandoId(categoria.id);
    setForm({
      nombre: categoria.nombre,
      slug: categoria.slug,
      descripcion: categoria.descripcion ?? "",
      imagenUrl: categoria.imagenUrl ?? "",
      orden: categoria.orden,
      destacada: categoria.destacada,
      tituloSeo: categoria.tituloSeo ?? "",
      descripcionSeo: categoria.descripcionSeo ?? "",
      padreId: categoria.padreId ?? "",
      activo: categoria.activo,
    });
    setSlugManual(true);
    setError(null);
  }

  function onSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);

    iniciarTransicion(async () => {
      const resultado = editandoId
        ? await actualizarCategoria(editandoId, form)
        : await crearCategoria(form);

      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }

      limpiar();
      router.refresh();
    });
  }

  function onEliminar(categoria: Fila) {
    if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;

    setError(null);
    iniciarTransicion(async () => {
      const resultado = await eliminarCategoria(categoria.id);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      if (editandoId === categoria.id) limpiar();
      router.refresh();
    });
  }

  // Al editar, una categoría no puede ser su propia madre.
  const posiblesPadres = categorias.filter((categoria) => categoria.id !== editandoId);

  return (
    <>
      <section className={styles.seccion}>
        <h2 className={styles.titulo}>{editandoId ? "Editar categoría" : "Nueva categoría"}</h2>

        <form className={styles.form} onSubmit={onSubmit}>
          {error && <p className={styles.mensajeError}>{error}</p>}

          <div className={styles.fila}>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Nombre</span>
              <input
                className={styles.control}
                value={form.nombre}
                required
                onChange={(evento) => {
                  const nombre = evento.target.value;
                  setForm((previo) => ({
                    ...previo,
                    nombre,
                    slug: slugManual ? previo.slug : slugificar(nombre),
                  }));
                }}
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Slug (URL)</span>
              <input
                className={styles.control}
                value={form.slug}
                required
                onChange={(evento) => {
                  setSlugManual(true);
                  setForm((previo) => ({ ...previo, slug: evento.target.value }));
                }}
              />
            </label>
          </div>

          <label className={styles.campo}>
            <span className={styles.etiqueta}>Descripción</span>
            <textarea
              className={`${styles.control} ${styles.textarea}`}
              value={form.descripcion}
              onChange={(evento) =>
                setForm((previo) => ({ ...previo, descripcion: evento.target.value }))
              }
            />
          </label>

          <div className={styles.fila}>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Imagen (URL)</span>
              <input
                className={styles.control}
                value={form.imagenUrl}
                placeholder="https://..."
                onChange={(evento) =>
                  setForm((previo) => ({ ...previo, imagenUrl: evento.target.value }))
                }
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Categoría padre</span>
              <select
                className={styles.control}
                value={form.padreId}
                onChange={(evento) =>
                  setForm((previo) => ({ ...previo, padreId: evento.target.value }))
                }
              >
                <option value="">Ninguna (categoría principal)</option>
                {posiblesPadres.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.fila}>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Orden de visualización</span>
              <input
                className={styles.control}
                type="number"
                min="0"
                value={form.orden}
                onChange={(evento) =>
                  setForm((previo) => ({ ...previo, orden: Number(evento.target.value) }))
                }
              />
            </label>

            <div className={`${styles.campo} ${styles.checkbox}`}>
              <button type="button" className={`${styles.switch} ${form.destacada ? styles.switchActivo : ""}`} role="switch" aria-checked={form.destacada} onClick={() => setForm((previo) => ({ ...previo, destacada: !previo.destacada }))}><span className={styles.switchPunto} aria-hidden="true" /></button>
              <span className={styles.etiqueta}>Destacada en la portada</span>
            </div>
          </div>

          <div className={styles.seccionEspaciada}>
            <h3 className={styles.bloqueTitulo}>SEO</h3>
            <p className={styles.bloqueAyuda}>Opcional. Se usa en el resultado de búsqueda de esta categoría.</p>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Título SEO</span>
              <input className={styles.control} maxLength={60} value={form.tituloSeo} onChange={(evento) => setForm((previo) => ({ ...previo, tituloSeo: evento.target.value }))} />
            </label>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Descripción SEO</span>
              <textarea className={`${styles.control} ${styles.textarea}`} maxLength={160} value={form.descripcionSeo} onChange={(evento) => setForm((previo) => ({ ...previo, descripcionSeo: evento.target.value }))} />
            </label>
          </div>

          <div className={`${styles.campo} ${styles.checkbox}`}><button type="button" className={`${styles.switch} ${form.activo ? styles.switchActivo : ""}`} role="switch" aria-checked={form.activo} onClick={() => setForm((previo) => ({ ...previo, activo: !previo.activo }))}><span className={styles.switchPunto} aria-hidden="true" /></button><span className={styles.etiqueta}>Visible en la tienda</span></div>

          <div className={styles.botones}>
            <button type="submit" className={styles.boton} disabled={pendiente}>
              {pendiente ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear categoría"}
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
        <h2 className={styles.titulo}>Categorías existentes</h2>

        {categorias.length === 0 ? (
          <p className={styles.vacio}>Todavía no hay categorías. Crea la primera arriba.</p>
        ) : (
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Slug</th>
                  <th>Padre</th>
                  <th>Orden</th>
                  <th>Productos</th>
                  <th>Portada</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categorias.map((categoria) => (
                  <tr key={categoria.id}>
                    <td>{categoria.nombre}</td>
                    <td>{categoria.slug}</td>
                    <td>
                      {categorias.find((otra) => otra.id === categoria.padreId)?.nombre ?? "-"}
                    </td>
                    <td>{categoria.orden}</td>
                    <td>{categoria.productos}</td>
                    <td>{categoria.destacada ? "Sí" : "-"}</td>
                    <td>
                      <span className={styles.badge}>
                        {categoria.activo ? "Visible" : "Oculta"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.acciones}>
                        <button
                          type="button"
                          className={styles.botonIcono}
                          title="Editar"
                          aria-label={`Editar ${categoria.nombre}`}
                          onClick={() => editar(categoria)}
                        >
                          <IconoEditar />
                        </button>
                        <button
                          type="button"
                          className={styles.botonIcono}
                          disabled={pendiente}
                          title="Eliminar"
                          aria-label={`Eliminar ${categoria.nombre}`}
                          onClick={() => onEliminar(categoria)}
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
