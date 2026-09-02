"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Select } from "@/components/ui/Select";
import { useCarritoHidratado } from "@/components/carrito/useCarritoHidratado";
import { calcularDescuentoCupon } from "@/features/cupones/calculo";
import { METODOS_PAGO } from "@/features/pedidos/metodos-pago";
import { crearPedido } from "@/features/pedidos/actions";
import departamentosData from "@/data/ubigeos/1_ubigeo_departamentos.json";
import provinciasData from "@/data/ubigeos/2_ubigeo_provincias.json";
import distritosData from "@/data/ubigeos/3_ubigeo_distritos.json";
import { calcularSubtotal, contarUnidades, useCartStore } from "@/store/cartStore";
import { formatearPrecio } from "@/lib/utils";
import styles from "./checkout.module.css";

const DEPARTAMENTOS = departamentosData.ubigeo_departamentos;
const PROVINCIAS = provinciasData.ubigeo_provincias;
const DISTRITOS = distritosData.ubigeo_distritos;

export type DireccionGuardada = {
  id: string;
  destinatario: string;
  telefono: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  referencia: string;
  codigoPostal: string;
  predeterminada: boolean;
};

const ENVIO_VACIO = {
  destinatario: "",
  telefono: "",
  departamento: "",
  provincia: "",
  distrito: "",
  direccion: "",
  referencia: "",
  codigoPostal: "",
};

export function FormularioCheckout({
  direcciones,
  contacto,
}: {
  direcciones: DireccionGuardada[];
  contacto: { nombre: string; telefono: string };
}) {
  const router = useRouter();
  const items = useCartStore((estado) => estado.items);
  const cupon = useCartStore((estado) => estado.cupon);
  const vaciar = useCartStore((estado) => estado.vaciar);
  const hidratado = useCarritoHidratado();

  // Con direcciones guardadas se parte de la predeterminada; si no, se
  // completa una nueva sin salir del checkout.
  const [direccionId, setDireccionId] = useState<string>(direcciones[0]?.id ?? "nueva");
  const [envio, setEnvio] = useState({
    ...ENVIO_VACIO,
    destinatario: contacto.nombre,
    telefono: contacto.telefono,
  });
  const [metodoPago, setMetodoPago] = useState<string>(METODOS_PAGO[0].clave);
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const usandoNueva = direccionId === "nueva";
  const guardada = direcciones.find((item) => item.id === direccionId) ?? null;
  const datosEnvio = usandoNueva
    ? envio
    : {
        destinatario: guardada?.destinatario || contacto.nombre,
        telefono: guardada?.telefono || contacto.telefono,
        departamento: guardada?.departamento ?? "",
        provincia: guardada?.provincia ?? "",
        distrito: guardada?.distrito ?? "",
        direccion: guardada?.direccion ?? "",
        referencia: guardada?.referencia ?? "",
        codigoPostal: guardada?.codigoPostal ?? "",
      };

  const subtotal = calcularSubtotal(items);
  const descuento = cupon ? calcularDescuentoCupon(cupon, subtotal) : 0;
  const total = Math.max(subtotal - descuento, 0);
  const unidades = contarUnidades(items);

  const departamento = DEPARTAMENTOS.find((item) => item.departamento === envio.departamento);
  const provincia = PROVINCIAS.find(
    (item) => item.provincia === envio.provincia && item.departamento_id === departamento?.id,
  );
  const provinciasDisponibles = PROVINCIAS.filter(
    (item) => item.departamento_id === departamento?.id,
  );
  const distritosDisponibles = DISTRITOS.filter((item) => item.provincia_id === provincia?.id);
  const distritoElegido = distritosDisponibles.find((item) => item.distrito === envio.distrito);

  function cambiar(campo: keyof typeof ENVIO_VACIO, valor: string) {
    setEnvio((actual) => ({ ...actual, [campo]: valor }));
    setError(null);
  }

  function confirmar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    iniciar(async () => {
      const resultado = await crearPedido({
        items: items.map((item) => ({ varianteId: item.varianteId, cantidad: item.cantidad })),
        metodoPago,
        envio: {
          ...datosEnvio,
          referencia: datosEnvio.referencia || undefined,
          codigoPostal: datosEnvio.codigoPostal || undefined,
        },
        codigoCupon: cupon?.codigo,
      });

      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }

      vaciar();
      router.push(`/pedido/${resultado.datos.id}?nuevo=1`);
    });
  }

  if (!hidratado) {
    return <p className={styles.cargando}>Cargando tu pedido…</p>;
  }

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada que pagar"
        descripcion="Agrega productos al carrito para completar tu compra."
        accion={{ href: "/productos", texto: "Ver productos" }}
      />
    );
  }

  return (
    <form className={styles.disposicion} onSubmit={confirmar}>
      <div className={styles.pasos}>
        <section className={styles.paso}>
          <h2 className={styles.pasoTitulo}>
            <span className={styles.pasoNumero}>01</span> Envío
          </h2>

          {direcciones.length > 0 ? (
            <div className={styles.opciones}>
              {direcciones.map((item) => (
                <label key={item.id} className={styles.opcion}>
                  <input
                    type="radio"
                    name="direccion"
                    value={item.id}
                    checked={direccionId === item.id}
                    onChange={() => {
                      setDireccionId(item.id);
                      setError(null);
                    }}
                  />
                  <span className={styles.opcionTexto}>
                    <span className={styles.opcionTitulo}>
                      {item.distrito}, {item.provincia}
                      {item.predeterminada ? (
                        <span className={styles.marca}>Predeterminada</span>
                      ) : null}
                    </span>
                    <span className={styles.opcionDetalle}>
                      {item.direccion}
                      {item.referencia ? ` · ${item.referencia}` : ""}
                    </span>
                    <span className={styles.opcionDetalle}>{item.departamento}</span>
                  </span>
                </label>
              ))}

              <label className={styles.opcion}>
                <input
                  type="radio"
                  name="direccion"
                  value="nueva"
                  checked={usandoNueva}
                  onChange={() => {
                    setDireccionId("nueva");
                    setError(null);
                  }}
                />
                <span className={styles.opcionTexto}>
                  <span className={styles.opcionTitulo}>Enviar a otra dirección</span>
                </span>
              </label>
            </div>
          ) : null}

          {usandoNueva ? (
            <div className={styles.campos}>
              <label className={styles.campo}>
                <span>Quién recibe</span>
                <input
                  required
                  value={envio.destinatario}
                  onChange={(evento) => cambiar("destinatario", evento.target.value)}
                />
              </label>
              <label className={styles.campo}>
                <span>Teléfono de contacto</span>
                <input
                  required
                  inputMode="tel"
                  value={envio.telefono}
                  onChange={(evento) => cambiar("telefono", evento.target.value)}
                />
              </label>

              <div className={styles.campo}>
                <span>Departamento</span>
                <Select
                  value={departamento ? String(departamento.id) : ""}
                  placeholder="Selecciona departamento"
                  ariaLabel="Departamento"
                  options={DEPARTAMENTOS.map((item) => ({
                    valor: String(item.id),
                    etiqueta: item.departamento,
                  }))}
                  onChange={(valor) => {
                    const elegido = DEPARTAMENTOS.find((item) => String(item.id) === valor);
                    setEnvio((actual) => ({
                      ...actual,
                      departamento: elegido?.departamento ?? "",
                      provincia: "",
                      distrito: "",
                    }));
                    setError(null);
                  }}
                />
              </div>

              <div className={styles.campo}>
                <span>Provincia</span>
                <Select
                  value={provincia ? String(provincia.id) : ""}
                  placeholder="Selecciona provincia"
                  ariaLabel="Provincia"
                  disabled={!departamento}
                  options={provinciasDisponibles.map((item) => ({
                    valor: String(item.id),
                    etiqueta: item.provincia,
                  }))}
                  onChange={(valor) => {
                    const elegido = provinciasDisponibles.find((item) => String(item.id) === valor);
                    setEnvio((actual) => ({
                      ...actual,
                      provincia: elegido?.provincia ?? "",
                      distrito: "",
                    }));
                    setError(null);
                  }}
                />
              </div>

              <div className={styles.campo}>
                <span>Distrito</span>
                <Select
                  value={distritoElegido ? String(distritoElegido.id) : ""}
                  placeholder="Selecciona distrito"
                  ariaLabel="Distrito"
                  disabled={!provincia}
                  options={distritosDisponibles.map((item) => ({
                    valor: String(item.id),
                    etiqueta: item.distrito,
                  }))}
                  onChange={(valor) => {
                    const elegido = distritosDisponibles.find((item) => String(item.id) === valor);
                    cambiar("distrito", elegido?.distrito ?? "");
                  }}
                />
              </div>

              <label className={`${styles.campo} ${styles.campoAncho}`}>
                <span>Dirección</span>
                <input
                  required
                  placeholder="Av., calle, número, interior"
                  value={envio.direccion}
                  onChange={(evento) => cambiar("direccion", evento.target.value)}
                />
              </label>

              <label className={`${styles.campo} ${styles.campoAncho}`}>
                <span>Referencia (opcional)</span>
                <input
                  value={envio.referencia}
                  onChange={(evento) => cambiar("referencia", evento.target.value)}
                />
              </label>
            </div>
          ) : null}
        </section>

        <section className={styles.paso}>
          <h2 className={styles.pasoTitulo}>
            <span className={styles.pasoNumero}>02</span> Pago
          </h2>

          <div className={styles.opciones}>
            {METODOS_PAGO.map((metodo) => (
              <label key={metodo.clave} className={styles.opcion}>
                <input
                  type="radio"
                  name="metodoPago"
                  value={metodo.clave}
                  checked={metodoPago === metodo.clave}
                  onChange={() => {
                    setMetodoPago(metodo.clave);
                    setError(null);
                  }}
                />
                <span className={styles.opcionTexto}>
                  <span className={styles.opcionTitulo}>{metodo.nombre}</span>
                  <span className={styles.opcionDetalle}>{metodo.resumen}</span>
                  {metodoPago === metodo.clave ? (
                    <span className={styles.instrucciones}>{metodo.instrucciones}</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <aside className={styles.resumen} aria-label="Resumen del pedido">
        <h2 className={styles.resumenTitulo}>Tu pedido</h2>

        <ul className={styles.items}>
          {items.map((item) => (
            <li key={item.varianteId} className={styles.item}>
              <span className={styles.itemNombre}>
                {item.nombre}
                <span className={styles.itemDetalle}>
                  {[item.talla, item.color].filter(Boolean).join(" / ")} × {item.cantidad}
                </span>
              </span>
              <span>{formatearPrecio(item.precio * item.cantidad)}</span>
            </li>
          ))}
        </ul>

        <div className={styles.fila}>
          <span>
            Productos ({unidades} {unidades === 1 ? "unidad" : "unidades"})
          </span>
          <span>{formatearPrecio(subtotal)}</span>
        </div>

        {descuento > 0 ? (
          <div className={`${styles.fila} ${styles.filaDescuento}`}>
            <span>Cupón {cupon?.codigo}</span>
            <span>−{formatearPrecio(descuento)}</span>
          </div>
        ) : null}

        <div className={styles.fila}>
          <span>Envío</span>
          <span className={styles.nota}>Se coordina con Shalom</span>
        </div>

        <div className={styles.total}>
          <span>Total</span>
          <span>{formatearPrecio(total)}</span>
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={enviando}>
          {enviando ? "Confirmando…" : "Confirmar pedido"}
        </Button>

        <p className={styles.aviso}>
          Tu pedido queda pendiente de pago. Te confirmamos cuando validemos el cobro.
        </p>
      </aside>
    </form>
  );
}
