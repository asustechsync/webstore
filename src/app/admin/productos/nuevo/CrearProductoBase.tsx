"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { crearProductoBorrador } from "@/features/catalogo/actions";
import styles from "../../admin.module.css";

export function CrearProductoBase() {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function crear() {
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await crearProductoBorrador();
      if (!resultado.ok) return setError(resultado.error);
      router.push(`/admin/productos/${resultado.datos.id}`);
      router.refresh();
    });
  }

  return (
    <div className={styles.bloque}>
      <p>Se reservará un SKU automáticamente y se abrirá el editor para completar el producto y sus variantes.</p>
      {error && <p className={styles.mensajeError}>{error}</p>}
      <button type="button" className={styles.boton} onClick={crear} disabled={pendiente}>
        {pendiente ? "Creando producto base..." : "Crear producto base"}
      </button>
    </div>
  );
}
