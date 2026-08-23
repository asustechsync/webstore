"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "../admin.module.css";

export function CambiarPasswordForm() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  async function onSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setExito(null);

    const formulario = evento.currentTarget;
    const formData = new FormData(formulario);
    const password = String(formData.get("password") ?? "");
    const confirmacion = String(formData.get("confirmacion") ?? "");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);
    const supabase = createClient();
    const { error: errorSupabase } = await supabase.auth.updateUser({ password });
    setCargando(false);

    if (errorSupabase) {
      setError(errorSupabase.message);
      return;
    }

    formulario.reset();
    setExito("Contraseña actualizada. Ya puedes ingresar con tu correo y esta contraseña.");
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error && <p className={styles.mensajeError}>{error}</p>}
      {exito && <p className={styles.mensajeExito}>{exito}</p>}

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Nueva contraseña</span>
        <input
          className={styles.control}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Repetir contraseña</span>
        <input
          className={styles.control}
          name="confirmacion"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <button type="submit" className={styles.boton} disabled={cargando}>
        {cargando ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
