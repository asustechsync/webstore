"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { IconoCerrar } from "@/components/ui/ActionIcons";
import { validarCupon } from "@/features/cupones/actions";
import { faltaParaMinimo } from "@/features/cupones/calculo";
import { formatearPrecio } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import styles from "./carrito.module.css";

/**
 * Alta y baja del cupón. El código lo valida el servidor; acá solo se muestra
 * el resultado y se avisa cuando el carrito deja de alcanzar el monto mínimo.
 */
export function FormularioCupon({ subtotal }: { subtotal: number }) {
  const cupon = useCartStore((estado) => estado.cupon);
  const aplicarCupon = useCartStore((estado) => estado.aplicarCupon);
  const quitarCupon = useCartStore((estado) => estado.quitarCupon);

  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    iniciar(async () => {
      const resultado = await validarCupon(codigo, subtotal);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      aplicarCupon(resultado.datos);
      setCodigo("");
    });
  }

  if (cupon) {
    const falta = faltaParaMinimo(cupon, subtotal);
    // Cuánto del monto mínimo ya cubre el carrito; con la barra se ve de un
    // vistazo si conviene sumar una unidad más para que el cupón entre.
    const avance =
      cupon.montoMinimo && cupon.montoMinimo > 0
        ? Math.min(Math.round((subtotal / cupon.montoMinimo) * 100), 100)
        : 100;

    return (
      <div className={styles.cuponAplicado}>
        <div className={styles.cuponEtiqueta}>
          <span className={styles.cuponCodigo}>{cupon.codigo}</span>
          <span className={styles.cuponDetalle}>
            {cupon.tipo === "PORCENTAJE"
              ? `-${cupon.valor}%`
              : `-${formatearPrecio(cupon.valor)}`}
          </span>
          <button
            type="button"
            className={styles.cuponQuitar}
            onClick={quitarCupon}
            aria-label={`Quitar el cupón ${cupon.codigo}`}
          >
            <IconoCerrar />
          </button>
        </div>

        {falta > 0 ? (
          <>
            <p className={styles.cuponAviso}>
              Agrega {formatearPrecio(falta)} para usar este cupón.
            </p>
            <div
              className={styles.cuponBarra}
              role="progressbar"
              aria-label="Avance hacia el mínimo del cupón"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={avance}
            >
              <span className={styles.cuponBarraRelleno} style={{ width: `${avance}%` }} />
            </div>
          </>
        ) : (
          <p className={styles.cuponListo}>Descuento aplicado a tu total.</p>
        )}
      </div>
    );
  }

  return (
    <form className={styles.cuponFormulario} onSubmit={enviar}>
      <label className={styles.cuponEtiquetaCampo} htmlFor="codigo-cupon">
        ¿Tienes un cupón?
      </label>
      <div className={styles.cuponCampo}>
        <input
          id="codigo-cupon"
          name="codigo"
          value={codigo}
          onChange={(evento) => {
            setCodigo(evento.target.value);
            setError(null);
          }}
          placeholder="Código"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className={styles.cuponInput}
          aria-invalid={error != null}
          aria-describedby={error ? "error-cupon" : undefined}
        />
        <Button
          type="submit"
          variante="secundario"
          anchoCompleto={false}
          disabled={enviando || codigo.trim().length === 0}
        >
          {enviando ? "Validando…" : "Aplicar"}
        </Button>
      </div>
      {error ? (
        <p id="error-cupon" className={styles.cuponError} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
