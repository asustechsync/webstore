"use client";

import { useState } from "react";
import { AtributosPanel } from "./AtributosPanel";
import styles from "../admin.module.css";

type Fila = Parameters<typeof AtributosPanel>[0]["atributos"];

export function CatalogoCamposPanel({ atributos }: { atributos: Fila }) {
  const [pestaña, setPestaña] = useState<"atributos" | "caracteristicas">("atributos");

  return (
    <>
      <nav className={styles.tabs} aria-label="Configuración del catálogo" role="tablist">
        <button type="button" role="tab" className={`${styles.tab} ${pestaña === "atributos" ? styles.tabActivo : ""}`} onClick={() => setPestaña("atributos")} aria-selected={pestaña === "atributos"}>Atributos</button>
        <button type="button" role="tab" className={`${styles.tab} ${pestaña === "caracteristicas" ? styles.tabActivo : ""}`} onClick={() => setPestaña("caracteristicas")} aria-selected={pestaña === "caracteristicas"}>Características</button>
      </nav>
      {pestaña === "atributos" ? <AtributosPanel atributos={atributos} /> : (
        <section className={styles.seccion}>
          <div className={styles.encabezadoSeccion}><h2 className={styles.titulo}>Características registradas</h2><button type="button" className={styles.boton} onClick={() => alert("La creación de características se habilitará al conectar su almacenamiento.")}>Crear característica</button></div>
          <p className={styles.bloqueAyuda}>Las características describen el producto y no generan variantes ni modifican la SKU.</p>
          <div className={styles.vacio}><strong>No hay características registradas</strong><p>Agrega campos como material, composición, cuidados, país de origen o temporada.</p></div>
        </section>
      )}
    </>
  );
}
