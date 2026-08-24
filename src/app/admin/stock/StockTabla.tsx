"use client";

import Image from "next/image";
import { AlertTriangle, CheckCircle2, CircleOff, XCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ajustarStock } from "@/features/catalogo/actions";
import styles from "../admin.module.css";

type Fila = {
  varianteId: string;
  producto: string;
  imagenUrl: string | null;
  opciones: string;
  sku: string;
  cantidad: number;
  stockMinimo: number;
  activo: boolean;
  actualizadoEn: string;
};

function estadoStock(cantidad: number, minimo: number, activo: boolean) {
  if (!activo) return { etiqueta: "Inactiva", clase: styles.stockInactivo, Icono: CircleOff };
  if (cantidad === 0) return { etiqueta: "Agotado", clase: styles.stockAgotado, Icono: XCircle };
  if (cantidad <= minimo) return { etiqueta: "Stock bajo", clase: styles.stockBajo, Icono: AlertTriangle };
  return { etiqueta: "Disponible", clase: styles.stockDisponible, Icono: CheckCircle2 };
}

function fechaCorta(fecha: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(fecha));
}

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
    return <p className={styles.vacio}>Registra variantes para controlar su stock.</p>;
  }

  return (
    <>
      {error && <p className={styles.mensajeError}>{error}</p>}

      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Producto</th>
              <th>SKU</th>
              <th>Cantidad</th>
              <th>Mínimo</th>
              <th>Estado</th>
              <th>Actualizado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {variantes.map((variante) => {
              const actual = valores[variante.varianteId];
              const bajo = Number(actual.cantidad) <= Number(actual.stockMinimo);
              const estado = estadoStock(Number(actual.cantidad), Number(actual.stockMinimo), variante.activo);

              return (
                <tr key={variante.varianteId}>
                  <td>
                    {variante.imagenUrl ? (
                      <Image
                        src={variante.imagenUrl}
                        alt=""
                        width={56}
                        height={56}
                        unoptimized
                        className={styles.stockImagen}
                      />
                    ) : <span className={styles.stockImagenVacia} aria-label="Sin imagen" />}
                  </td>
                  <td>
                    <strong>{variante.producto}</strong>
                    <span className={styles.stockVariante}>{variante.opciones}</span>
                  </td>
                  <td>{variante.sku}</td>
                  <td className={bajo && variante.activo ? styles.alerta : undefined}>
                    <input
                      className={`${styles.control} ${styles.stockCantidadControl}`}
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
                      className={`${styles.control} ${styles.stockCantidadControl}`}
                      type="number"
                      min="0"
                      value={actual.stockMinimo}
                      onChange={(evento) =>
                        actualizar(variante.varianteId, "stockMinimo", evento.target.value)
                      }
                    />
                  </td>
                  <td>
                    <span className={`${styles.stockEstado} ${estado.clase}`} title={estado.etiqueta} aria-label={estado.etiqueta}>
                      <estado.Icono size={18} aria-hidden="true" />
                    </span>
                  </td>
                  <td className={styles.stockFecha}>{fechaCorta(variante.actualizadoEn)}</td>
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
