"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarMiPerfil } from "@/features/usuarios/cuenta-actions";
import styles from "../cuenta.module.css";

export function PerfilForm({ perfil }: { perfil: { nombre: string; apellidos: string; telefono: string; email: string } }) {
  const router = useRouter();
  const [form, setForm] = useState(perfil);
  const [pendiente, iniciarTransicion] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "exito"; texto: string } | null>(null);

  function onSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setMensaje(null);
    iniciarTransicion(async () => {
      const resultado = await actualizarMiPerfil({ nombre: form.nombre, apellidos: form.apellidos, telefono: form.telefono });
      if (!resultado.ok) return setMensaje({ tipo: "error", texto: resultado.error });
      setMensaje({ tipo: "exito", texto: "Tus datos se actualizaron correctamente." });
      router.refresh();
    });
  }

  return <form className={styles.formulario} onSubmit={onSubmit}>
    {mensaje && <p className={mensaje.tipo === "error" ? styles.mensajeError : styles.mensajeExito}>{mensaje.texto}</p>}
    <div className={styles.formGrid}>
      <label className={styles.campo}><span>Nombres</span><input value={form.nombre} required onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} /></label>
      <label className={styles.campo}><span>Apellidos</span><input value={form.apellidos} onChange={(e) => setForm((p) => ({ ...p, apellidos: e.target.value }))} /></label>
      <label className={styles.campo}><span>Correo electrónico</span><input value={form.email} type="email" readOnly aria-describedby="ayuda-correo" /><small id="ayuda-correo">Tu correo también es tu acceso a la tienda.</small></label>
      <label className={styles.campo}><span>Teléfono</span><input value={form.telefono} inputMode="tel" placeholder="Ej.: 987 654 321" onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} /></label>
    </div>
    <button className={styles.botonPrimario} type="submit" disabled={pendiente}>{pendiente ? "Guardando..." : "Guardar cambios"}</button>
  </form>;
}
