"use client";

import Image from "next/image";
import { IconoDisponible, IconoInactiva, IconoSinStock, IconoStockBajo } from "@/components/ui/ActionIcons";
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

function IconoGuardar({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 640 640" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 237.3C544 220.3 537.3 204 525.3 192L448 114.7C436 102.7 419.7 96 402.7 96L160 96zM192 192C192 174.3 206.3 160 224 160L384 160C401.7 160 416 174.3 416 192L416 256C416 273.7 401.7 288 384 288L224 288C206.3 288 192 273.7 192 256L192 192zM320 352C355.3 352 384 380.7 384 416C384 451.3 355.3 480 320 480C284.7 480 256 451.3 256 416C256 380.7 284.7 352 320 352z"
      />
    </svg>
  );
}

function estadoStock(cantidad: number, minimo: number, activo: boolean) {
  if (!activo) return { etiqueta: "Inactiva", clase: styles.stockInactivo, Icono: IconoInactiva };
  if (cantidad === 0) return { etiqueta: "Agotado", clase: styles.stockAgotado, Icono: IconoSinStock };
  if (cantidad <= minimo) return { etiqueta: "Stock bajo", clase: styles.stockBajo, Icono: IconoStockBajo };
  return { etiqueta: "Disponible", clase: styles.stockDisponible, Icono: IconoDisponible };
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
              const cantidad = Number(actual.cantidad);
              const minimo = Number(actual.stockMinimo);
              const estado = estadoStock(cantidad, minimo, variante.activo);

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
                  <td>
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
                      <estado.Icono color="currentColor" aria-hidden="true" />
                    </span>
                  </td>
                  <td className={styles.stockFecha}>{fechaCorta(variante.actualizadoEn)}</td>
                  <td>
                    <div className={styles.acciones}>
                      <button
                        type="button"
                        className={styles.botonIcono}
                        disabled={pendiente}
                        title="Guardar cambios"
                        aria-label={`Guardar cambios de ${variante.producto} (${variante.sku})`}
                        onClick={() => onGuardar(variante.varianteId)}
                      >
                        <IconoGuardar size={20} />
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
