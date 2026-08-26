"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { eliminarValorAtributoCatalogo, reordenarValoresAtributoCatalogo } from "@/features/catalogo/actions/atributos";
import { COLORES_POR_NOMBRE } from "@/features/catalogo/opciones";
import { IconoEditar, IconoEliminar } from "@/components/ui/ActionIcons";
import styles from "../../admin.module.css";

type Valor = { id: string; valor: string; orden: number; colorHex: string | null };

export function ValoresAtributoPanel({ atributoId, nombre, valores, esColor }: { atributoId: string; nombre: string; valores: Valor[]; esColor: boolean }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ordenLocal, setOrdenLocal] = useState(valores);
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);
  const [destinoId, setDestinoId] = useState<string | null>(null);

  function eliminar(id: string, valor: string) {
    if (!confirm(`¿Eliminar el valor "${valor}"?`)) return;
    iniciarTransicion(async () => {
      const resultado = await eliminarValorAtributoCatalogo(atributoId, id);
      if (!resultado.ok) return setError(resultado.error);
      setOrdenLocal((actual) => actual.filter((item) => item.id !== id));
      router.refresh();
    });
  }

  function soltarSobre(destinoId: string) {
    if (!arrastrandoId || arrastrandoId === destinoId) { setArrastrandoId(null); setDestinoId(null); return; }
    const origen = ordenLocal.findIndex((item) => item.id === arrastrandoId);
    const destino = ordenLocal.findIndex((item) => item.id === destinoId);
    if (origen < 0 || destino < 0) { setArrastrandoId(null); setDestinoId(null); return; }
    const nuevoOrden = [...ordenLocal];
    const [movido] = nuevoOrden.splice(origen, 1);
    nuevoOrden.splice(destino, 0, movido);
    setOrdenLocal(nuevoOrden);
    setArrastrandoId(null);
    setDestinoId(null);
    iniciarTransicion(async () => {
      const resultado = await reordenarValoresAtributoCatalogo(atributoId, nuevoOrden.map((item) => item.id));
      if (!resultado.ok) return setError(resultado.error);
      router.refresh();
    });
  }

  return <section className={styles.bloque}>
    <div className={styles.encabezadoSeccion}>
      <div><h2 className={styles.titulo}>Valores de {nombre}</h2><p className={styles.bloqueAyuda}>Cada valor es un registro independiente.</p></div>
      <Link href={`/admin/atributos/${atributoId}/valores/nuevo`} className={styles.boton}>Crear valor</Link>
    </div>
    {error && <p className={styles.mensajeError}>{error}</p>}
    {ordenLocal.length === 0 ? <p className={styles.vacio}>Aún no hay valores para este atributo.</p> : <div className={styles.tablaWrap}><table className={styles.tabla}><thead><tr><th>Posición</th><th>Orden</th><th>Valor</th>{esColor && <th>Color</th>}<th /></tr></thead><tbody>{ordenLocal.map((item, indice) => { const color = item.colorHex ?? COLORES_POR_NOMBRE[item.valor.toLocaleLowerCase("es")] ?? "#FFFFFF"; return <tr key={item.id} className={`${styles.filaArrastrable} ${arrastrandoId === item.id ? styles.filaArrastrableActiva : ""} ${destinoId === item.id && arrastrandoId !== item.id ? styles.filaArrastrableDestino : ""}`} onDragOver={(evento) => { evento.preventDefault(); evento.dataTransfer.dropEffect = "move"; }} onDragEnter={() => arrastrandoId && setDestinoId(item.id)} onDragLeave={(evento) => { if (!evento.currentTarget.contains(evento.relatedTarget as Node)) setDestinoId(null); }} onDrop={() => soltarSobre(item.id)}><td><button type="button" className={styles.agarreOrden} draggable={!pendiente} onDragStart={(evento) => { evento.dataTransfer.effectAllowed = "move"; evento.dataTransfer.setData("text/plain", item.id); setArrastrandoId(item.id); }} onDragEnd={() => { setArrastrandoId(null); setDestinoId(null); }} aria-label={`Arrastrar ${item.valor} para cambiar el orden`} title="Arrastrar para ordenar">⠿</button></td><td>{indice + 1}</td><td>{item.valor}</td>{esColor && <td><span className={styles.muestraColor} style={{ backgroundColor: color }} title={color} aria-label={`Color ${color}`} /></td>}<td><div className={styles.acciones}><Link href={`/admin/atributos/${atributoId}/valores/${item.id}`} className={styles.botonIcono} aria-label={`Editar ${item.valor}`} title="Editar"><IconoEditar /></Link><button type="button" className={styles.botonIcono} disabled={pendiente} onClick={() => eliminar(item.id, item.valor)} aria-label={`Eliminar ${item.valor}`} title="Eliminar"><IconoEliminar /></button></div></td></tr>; })}</tbody></table></div>}
  </section>;
}
