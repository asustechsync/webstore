"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { crearProductoBorrador } from "@/features/catalogo/actions/productos";
import styles from "../../admin.module.css";

type Categoria = { id: string; nombre: string };

export function CrearProductoBase({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [modoVariantes, setModoVariantes] = useState(true);
  const [codigoTipo, setCodigoTipo] = useState<"ME" | "BO" | "PR" | "BR" | "OT">("ME");

  function crear(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await crearProductoBorrador({ nombre, categoriaId, modoVariantes, codigoTipo });
      if (!resultado.ok) return setError(resultado.error);
      router.push(`/admin/productos/${resultado.datos.id}`);
      router.refresh();
    });
  }

  return (
    <form className={`${styles.form} ${styles.bloque}`} onSubmit={crear}>
      <p className={styles.bloqueAyuda}>Se creará un producto padre en borrador y se reservará su SKU. No se mostrará en la tienda hasta que lo publiques.</p>
      {error && <p className={styles.mensajeError}>{error}</p>}
      <label className={styles.campo}><span className={styles.etiqueta}>Nombre del producto</span><input className={styles.control} required value={nombre} onChange={(evento) => setNombre(evento.target.value)} placeholder="Ej.: Polo básico cuello redondo" /></label>
      <label className={styles.campo}><span className={styles.etiqueta}>Categoría principal</span><select className={styles.control} required value={categoriaId} onChange={(evento) => setCategoriaId(evento.target.value)}><option value="">Seleccionar categoría</option>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}</select></label>
      <label className={styles.campo}><span className={styles.etiqueta}>Tipo de producto</span><select className={styles.control} required value={codigoTipo} onChange={(evento) => setCodigoTipo(evento.target.value as typeof codigoTipo)}><option value="ME">Media (ME)</option><option value="BO">Boxer (BO)</option><option value="PR">Prenda (PR)</option><option value="BR">Brasier (BR)</option><option value="OT">Otro (OT)</option></select></label>
      <fieldset className={styles.selectorTipoProducto}><legend className={styles.etiqueta}>¿Cómo se vende?</legend><label><input type="radio" checked={!modoVariantes} onChange={() => setModoVariantes(false)} /> Una sola presentación</label><label><input type="radio" checked={modoVariantes} onChange={() => setModoVariantes(true)} /> Con variantes (talla, color, etc.)</label></fieldset>
      <button type="submit" className={styles.boton} disabled={pendiente || categorias.length === 0}>
        {pendiente ? "Creando borrador..." : "Crear producto"}
      </button>
      {categorias.length === 0 && <p className={styles.mensajeError}>Primero crea una categoría.</p>}
    </form>
  );
}
