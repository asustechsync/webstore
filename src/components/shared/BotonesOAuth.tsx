"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./BotonesOAuth.module.css";

const PROVEEDORES = [
  { id: "google", nombre: "Google" },
  { id: "azure", nombre: "Microsoft" },
  { id: "facebook", nombre: "Facebook" },
] as const;

export function BotonesOAuth() {
  const [cargando, setCargando] = useState<string | null>(null);

  async function ingresarCon(proveedor: (typeof PROVEEDORES)[number]["id"]) {
    setCargando(proveedor);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: proveedor,
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    // El navegador redirige al proveedor; si vuelve sin completar, se libera el botón.
    setCargando(null);
  }

  return (
    <div className={styles.contenedor}>
      <p className={styles.separador}>o continúa con</p>
      {PROVEEDORES.map((proveedor) => (
        <button
          key={proveedor.id}
          type="button"
          className={styles.boton}
          disabled={cargando !== null}
          onClick={() => ingresarCon(proveedor.id)}
        >
          {cargando === proveedor.id ? "Redirigiendo..." : proveedor.nombre}
        </button>
      ))}
    </div>
  );
}
