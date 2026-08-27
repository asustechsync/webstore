"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "../cuenta.module.css";

export function SeguridadForm() {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "exito"; texto: string } | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMensaje(null);
    const formulario = e.currentTarget; const datos = new FormData(formulario);
    const password = String(datos.get("password") ?? ""); const confirmacion = String(datos.get("confirmacion") ?? "");
    if (password.length < 8) return setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 8 caracteres." });
    if (password !== confirmacion) return setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden." });
    setCargando(true); const { error } = await createClient().auth.updateUser({ password }); setCargando(false);
    if (error) return setMensaje({ tipo: "error", texto: error.message });
    formulario.reset(); setMensaje({ tipo: "exito", texto: "Tu contraseña se actualizó correctamente." });
  }
  return <form className={styles.formulario} onSubmit={onSubmit}>
    {mensaje && <p className={mensaje.tipo === "error" ? styles.mensajeError : styles.mensajeExito}>{mensaje.texto}</p>}
    <div className={styles.formGrid}>
      <label className={styles.campo}><span>Nueva contraseña</span><input name="password" type="password" minLength={8} autoComplete="new-password" required /><small>Mínimo 8 caracteres.</small></label>
      <label className={styles.campo}><span>Confirmar contraseña</span><input name="confirmacion" type="password" minLength={8} autoComplete="new-password" required /></label>
    </div>
    <button className={styles.botonPrimario} type="submit" disabled={cargando}>{cargando ? "Actualizando..." : "Actualizar contraseña"}</button>
  </form>;
}
