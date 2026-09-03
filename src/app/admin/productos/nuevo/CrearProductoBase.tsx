"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { crearProductoBorrador } from "@/features/catalogo/actions/productos";
import { CODIGOS_TIPO, type CodigoTipo } from "@/features/catalogo/opciones";
import { SelectConFlecha } from "@/components/ui/SelectConFlecha";
import styles from "../../admin.module.css";

type Categoria = { id: string; nombre: string };

const MODOS = [
  {
    variantes: false,
    titulo: "Producto único",
    resumen: "Se vende tal cual, sin tallas ni colores.",
    detalle: "Un solo SKU, un solo precio y un solo stock. Ideal para un accesorio o un pack cerrado.",
  },
  {
    variantes: true,
    titulo: "Producto con variantes",
    resumen: "Varias combinaciones de talla, color, diseño…",
    detalle: "Cada combinación tiene su propio SKU, stock y precio. El SKU se arma solo con los atributos que elijas.",
  },
] as const;

export function CrearProductoBase({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [modoVariantes, setModoVariantes] = useState<boolean | null>(null);
  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [codigoTipo, setCodigoTipo] = useState<CodigoTipo>("ME");

  function crear(evento: React.FormEvent) {
    evento.preventDefault();
    if (modoVariantes === null) return;
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await crearProductoBorrador({ nombre, categoriaId, modoVariantes, codigoTipo });
      if (!resultado.ok) return setError(resultado.error);
      router.push(`/admin/productos/${resultado.datos.id}`);
      router.refresh();
    });
  }

  if (categorias.length === 0) {
    return <p className={styles.mensajeError}>Primero crea una categoría para poder registrar productos.</p>;
  }

  // Paso 1: el tipo se elige antes de escribir nada, porque decide qué campos
  // pide el paso 2 y si el producto llevará atributos o no.
  if (modoVariantes === null) {
    return (
      <div className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>¿Cómo se vende este producto?</h2>
        <p className={styles.bloqueAyuda}>Elige una opción; podrás cambiarla después desde el producto.</p>
        <div className={styles.selectorModo}>
          {MODOS.map((modo) => (
            <button
              key={modo.titulo}
              type="button"
              className={styles.tarjetaModo}
              onClick={() => setModoVariantes(modo.variantes)}
            >
              <strong>{modo.titulo}</strong>
              <span className={styles.tarjetaModoResumen}>{modo.resumen}</span>
              <span className={styles.tarjetaModoDetalle}>{modo.detalle}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const modo = MODOS.find((actual) => actual.variantes === modoVariantes)!;

  return (
    <form className={`${styles.form} ${styles.bloque}`} onSubmit={crear}>
      <div className={styles.modoElegido}>
        <div>
          <strong>{modo.titulo}</strong>
          <span>{modo.resumen}</span>
        </div>
        <button type="button" className={styles.botonChico} onClick={() => setModoVariantes(null)}>
          Cambiar
        </button>
      </div>

      {error && <p className={styles.mensajeError}>{error}</p>}

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Nombre del producto</span>
        <input className={styles.control} required minLength={3} value={nombre} onChange={(evento) => setNombre(evento.target.value)} placeholder="Ej.: Polo básico cuello redondo" />
      </label>

      <div className={styles.fila}>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Categoría</span>
          <SelectConFlecha className={styles.control} required value={categoriaId} onChange={(evento) => setCategoriaId(evento.target.value)}>
            <option value="">Seleccionar categoría</option>
            {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
          </SelectConFlecha>
        </label>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Tipo (define el código)</span>
          <SelectConFlecha className={styles.control} required value={codigoTipo} onChange={(evento) => setCodigoTipo(evento.target.value as CodigoTipo)}>
            {CODIGOS_TIPO.map((tipo) => <option key={tipo.codigo} value={tipo.codigo}>{tipo.nombre} ({tipo.codigo})</option>)}
          </SelectConFlecha>
        </label>
      </div>

      <p className={styles.bloqueAyuda}>
        Se reservará un código correlativo del tipo <strong>{codigoTipo}-001</strong>
        {modoVariantes ? ", y cada variante derivará el suyo a partir de él." : ", que será el SKU de este producto."}
        {" "}El producto nace en borrador y no aparece en la tienda hasta que lo publiques.
      </p>

      <div className={styles.botones}>
        <button type="submit" className={styles.boton} disabled={pendiente}>
          {pendiente ? "Creando…" : "Crear y continuar"}
        </button>
        <button type="button" className={styles.botonSecundario} onClick={() => router.push("/admin/productos")}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
