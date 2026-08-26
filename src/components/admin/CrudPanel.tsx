"use client";

import type { ReactNode } from "react";
import styles from "./CrudPanel.module.css";

type CrudPanelProps = {
  mostrarFormulario: boolean;
  tituloFormulario: string;
  tituloLista: string;
  etiquetaCrear: string;
  onCrear: () => void;
  onCancelar: () => void;
  formulario: ReactNode;
  lista: ReactNode;
};

/**
 * Mantiene una sola convención para los CRUD simples del administrador:
 * la lista y el formulario nunca compiten por espacio en la misma vista.
 */
export function CrudPanel({
  mostrarFormulario,
  tituloFormulario,
  tituloLista,
  etiquetaCrear,
  onCrear,
  onCancelar,
  formulario,
  lista,
}: CrudPanelProps) {
  if (mostrarFormulario) {
    return (
      <section className={styles.seccion}>
        <div className={styles.encabezado}>
          <h2 className={styles.titulo}>{tituloFormulario}</h2>
          <button type="button" className={styles.botonSecundario} onClick={onCancelar}>
            Cancelar
          </button>
        </div>
        {formulario}
      </section>
    );
  }

  return (
    <section className={styles.bloque}>
      <div className={styles.encabezado}>
        <h2 className={styles.titulo}>{tituloLista}</h2>
        <button type="button" className={styles.boton} onClick={onCrear}>
          {etiquetaCrear}
        </button>
      </div>
      {lista}
    </section>
  );
}
