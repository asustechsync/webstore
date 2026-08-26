"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { actualizarValorAtributoCatalogo, crearValorAtributoCatalogo } from "@/features/catalogo/actions/atributos";
import styles from "../../../admin.module.css";

export function ValorForm({ atributoId, valorId, valorInicial = "", colorHexInicial = "", esColor = false }: { atributoId: string; valorId?: string; valorInicial?: string; colorHexInicial?: string; esColor?: boolean }) {
  const router = useRouter(); const [valor, setValor] = useState(valorInicial); const [colorHex, setColorHex] = useState(colorHexInicial || "#000000"); const [error, setError] = useState<string | null>(null); const [pendiente, iniciarTransicion] = useTransition();
  function guardar(evento: React.FormEvent) { evento.preventDefault(); setError(null); iniciarTransicion(async () => { const datos = { valor, colorHex: esColor ? colorHex : undefined }; const resultado = valorId ? await actualizarValorAtributoCatalogo(atributoId, valorId, datos) : await crearValorAtributoCatalogo(atributoId, datos); if (!resultado.ok) return setError(resultado.error); router.push(`/admin/atributos/${atributoId}`); router.refresh(); }); }
  return <section className={styles.seccion}><form className={styles.form} onSubmit={guardar}>{error && <p className={styles.mensajeError}>{error}</p>}<label className={styles.campo}><span className={styles.etiqueta}>Valor</span><input className={styles.control} required autoFocus value={valor} onChange={(evento) => setValor(evento.target.value)} placeholder="Ej.: Negro" /></label>{esColor && <label className={styles.campo}><span className={styles.etiqueta}>Paleta de color</span><div className={styles.selectorColor}><input type="color" value={colorHex} onChange={(evento) => setColorHex(evento.target.value)} aria-label="Seleccionar color" /><output>{colorHex.toUpperCase()}</output></div></label>}<div className={styles.botones}><button className={styles.boton} disabled={pendiente}>{pendiente ? "Guardando..." : "Guardar valor"}</button><button type="button" className={styles.botonSecundario} onClick={() => router.push(`/admin/atributos/${atributoId}`)}>Cancelar</button></div></form></section>;
}
