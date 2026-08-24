"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./BotonesOAuth.module.css";

const PROVEEDORES = [
  { id: "google", nombre: "Google" },
  // La tienda solo necesita identificar al cliente. No solicitamos acceso a
  // calendarios, contactos, archivos ni refresh tokens del proveedor.
  { id: "azure", nombre: "Microsoft" },
  // `public_profile` es el perfil básico que Meta incluye por defecto;
  // `email` permite a Supabase crear y asociar la cuenta del cliente.
  { id: "facebook", nombre: "Facebook" },
] as const;

export function BotonesOAuth() {
  const [cargando, setCargando] = useState<string | null>(null);

  async function ingresarCon(proveedor: (typeof PROVEEDORES)[number]["id"]) {
    setCargando(proveedor);
    const supabase = createClient();
    const scopes =
      proveedor === "google"
        ? "openid email profile"
        : proveedor === "azure" || proveedor === "facebook"
          ? "email"
          : undefined;

    await supabase.auth.signInWithOAuth({
      provider: proveedor,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        ...(scopes ? { scopes } : {}),
      },
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
