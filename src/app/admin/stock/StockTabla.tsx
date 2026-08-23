"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ajustarStock } from "@/features/catalogo/actions";
import styles from "../admin.module.css";

type Fila = {
  varianteId: string;
  producto: string;
  talla: string;
  color: string;
  sku: string;
  cantidad: number;
  stockMinimo: number;
  activo: boolean;
};

export function StockTabla({ variantes }: { variantes: Fila[] }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState<string | null>(null);
  const [valores, setValores] = useState<Record<string, { cantidad: string; stockMinimo: string }>>(
    () =>
      Object.fromEntries(
        variantes.map((variante) => [
          variante.varianteId,
          {
            cantidad: String(variante.cantidad),
            stockMinimo: String(variante.stockMinimo),
          },
        ]),
      ),
  );

  function actualizar(varianteId: string, campo: "cantidad" | "stockMinimo", valor: string) {
    setValores((previo) => ({
      ...previo,
      [varianteId]: { ...previo[varianteId], [campo]: valor },
    }));
    setGuardado(null);
  }

  function onGuardar(varianteId: string) {
    setError(null);
    setGuardado(null);

    iniciarTransicion(async () => {
      const resultado = await ajustarStock(varianteId, valores[varianteId]);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setGuardado(varianteId);
      router.refresh();
    });
  }

  if (variantes.length === 0) {
    return <p className={styles.vacio}>Registra productos con tallas para controlar su stock.</p>;
  }

  return (
    <>
      {error && <p className={styles.mensajeError}>{error}</p>}

      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Talla</th>
              <th>Color</th>
              <th>SKU</th>
              <th>Cantidad</th>
              <th>Mínimo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {variantes.map((variante) => {
              const actual = valores[variante.varianteId];
              const bajo = Number(actual.cantidad) <= Number(actual.stockMinimo);

              return (
                <tr key={variante.varianteId}>
                  <td>
                    {variante.producto}
                    {!variante.activo && " (talla inactiva)"}
                  </td>
                  <td>{variante.talla}</td>
                  <td>{variante.color || "—"}</td>
                  <td>{variante.sku}</td>
                  <td className={bajo && variante.activo ? styles.alerta : undefined}>
                    <input
                      className={styles.control}
                      type="number"
                      min="0"
                      value={actual.cantidad}
                      onChange={(evento) =>
                        actualizar(variante.varianteId, "cantidad", evento.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className={styles.control}
                      type="number"
                      min="0"
                      value={actual.stockMinimo}
                      onChange={(evento) =>
                        actualizar(variante.varianteId, "stockMinimo", evento.target.value)
                      }
                    />
                  </td>
                  <td>
                    <div className={styles.acciones}>
                      <button
                        type="button"
                        className={styles.botonChico}
                        disabled={pendiente}
                        onClick={() => onGuardar(variante.varianteId)}
                      >
                        Guardar
                      </button>
                      {guardado === variante.varianteId && (
                        <span className={styles.badge}>Guardado</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
