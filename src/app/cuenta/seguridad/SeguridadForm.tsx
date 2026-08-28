"use client";

import { useEffect, useState } from "react";
import type { UserIdentity } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { IconoOjo } from "@/components/ui/IconoOjo";
import styles from "../cuenta.module.css";

const PROVEEDORES = [
  { id: "google", nombre: "Google" },
  { id: "azure", nombre: "Microsoft" },
  { id: "facebook", nombre: "Facebook" },
] as const;

const ICONO_ENLACE = "M451.5 160C434.9 160 418.8 164.5 404.7 172.7C388.9 156.7 370.5 143.3 350.2 133.2C378.4 109.2 414.3 96 451.5 96C537.9 96 608 166 608 252.5C608 294 591.5 333.8 562.2 363.1L491.1 434.2C461.8 463.5 422 480 380.5 480C294.1 480 224 410 224 323.5C224 322 224 320.5 224.1 319C224.6 301.3 239.3 287.4 257 287.9C274.7 288.4 288.6 303.1 288.1 320.8C288.1 321.7 288.1 322.6 288.1 323.4C288.1 374.5 329.5 415.9 380.6 415.9C405.1 415.9 428.6 406.2 446 388.8L517.1 317.7C534.4 300.4 544.2 276.8 544.2 252.3C544.2 201.2 502.8 159.8 451.7 159.8zM307.2 237.3C305.3 236.5 303.4 235.4 301.7 234.2C289.1 227.7 274.7 224 259.6 224C235.1 224 211.6 233.7 194.2 251.1L123.1 322.2C105.8 339.5 96 363.1 96 387.6C96 438.7 137.4 480.1 188.5 480.1C205 480.1 221.1 475.7 235.2 467.5C251 483.5 269.4 496.9 289.8 507C261.6 530.9 225.8 544.2 188.5 544.2C102.1 544.2 32 474.2 32 387.7C32 346.2 48.5 306.4 77.8 277.1L148.9 206C178.2 176.7 218 160.2 259.5 160.2C346.1 160.2 416 230.8 416 317.1C416 318.4 416 319.7 416 321C415.6 338.7 400.9 352.6 383.2 352.2C365.5 351.8 351.6 337.1 352 319.4C352 318.6 352 317.9 352 317.1C352 283.4 334 253.8 307.2 237.5z";
const ICONO_ENLACE_ROTO = "M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L478.9 445.2C483.1 441.8 487.2 438.1 491 434.3L562.1 363.2C591.4 333.9 607.9 294.1 607.9 252.6C607.9 166.2 537.9 96.1 451.4 96.1C414.1 96.1 378.3 109.4 350.1 133.3C370.4 143.4 388.8 156.8 404.6 172.8C418.7 164.5 434.8 160.1 451.4 160.1C502.5 160.1 543.9 201.5 543.9 252.6C543.9 277.1 534.2 300.6 516.8 318L445.7 389.1C441.8 393 437.6 396.5 433.1 399.6L385.6 352.1C402.1 351.2 415.3 337.7 415.8 321C415.8 319.7 415.8 318.4 415.8 317.1C415.8 230.8 345.9 160.2 259.3 160.2C240.1 160.2 221.4 163.7 203.8 170.4L73 39.1zM257.9 224C258.5 224 259 224 259.6 224C274.7 224 289.1 227.7 301.7 234.2C303.5 235.4 305.3 236.5 307.2 237.3C334 253.6 352 283.2 352 316.9C352 317.3 352 317.7 352 318.1L257.9 224zM378.2 480L224 325.8C225.2 410.4 293.6 478.7 378.1 479.9zM171.7 273.5L126.4 228.2L77.8 276.8C48.5 306.1 32 345.9 32 387.4C32 473.8 102 543.9 188.5 543.9C225.7 543.9 261.6 530.6 289.8 506.7C269.5 496.6 251 483.2 235.2 467.2C221.2 475.4 205.1 479.8 188.5 479.8C137.4 479.8 96 438.4 96 387.3C96 362.8 105.7 339.3 123.1 321.9L171.7 273.3z";

function IconoEnlace({ roto }: { roto: boolean }) {
  return <svg viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path d={roto ? ICONO_ENLACE_ROTO : ICONO_ENLACE} /></svg>;
}

function mensajeErrorVinculacion(mensaje: string) {
  if (mensaje.toLowerCase().includes("at least 1 identity after unlinking")) {
    return "No puedes desvincular tu único método de acceso.";
  }
  return "No se pudo desvincular la cuenta. Inténtalo nuevamente.";
}

export function CuentasVinculadas() {
  const [identidades, setIdentidades] = useState<UserIdentity[] | null>(null);
  const [vinculando, setVinculando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    createClient().auth.getUser().then(({ data }) => {
      if (activo) setIdentidades(data.user?.identities ?? []);
    });
    return () => { activo = false; };
  }, []);

  async function vincular(proveedor: string) {
    setError(null); setVinculando(proveedor);
    const { data, error: resultado } = await createClient().auth.linkIdentity({
      provider: proveedor as "google" | "azure" | "facebook",
      options: { redirectTo: `${window.location.origin}/api/auth/callback?redirectTo=/cuenta/seguridad` },
    });
    if (resultado || !data?.url) { setError(resultado?.message ?? "No se pudo iniciar la vinculación."); setVinculando(null); return; }
    window.location.assign(data.url);
  }

  async function desvincular(proveedor: string) {
    const identidad = identidades?.find((item) => item.provider === proveedor);
    if (!identidad || !window.confirm(`¿Deseas desvincular tu cuenta de ${PROVEEDORES.find((item) => item.id === proveedor)?.nombre ?? proveedor}?`)) return;
    setError(null); setVinculando(proveedor);
    const { error: resultado } = await createClient().auth.unlinkIdentity(identidad);
    if (resultado) { setError(mensajeErrorVinculacion(resultado.message)); setVinculando(null); return; }
    setIdentidades((actuales) => actuales?.filter((item) => item.provider !== proveedor) ?? []);
    setVinculando(null);
  }

  return <section className={styles.cuentasVinculadas} aria-labelledby="cuentas-vinculadas-titulo">
    <div><h3 id="cuentas-vinculadas-titulo">Cuentas vinculadas</h3><p>Consulta los métodos asociados a tu cuenta.</p></div>
    {error && <p className={styles.mensajeError}>{error}</p>}
    <div className={styles.listaVinculadas}>
      {PROVEEDORES.map((proveedor) => {
        const conectado = identidades?.some((item) => item.provider === proveedor.id) ?? false;
        return <div className={styles.cuentaVinculada} key={proveedor.id}><span>{proveedor.nombre}</span><div className={styles.estadoVinculada}><small className={conectado ? styles.vinculadaActiva : ""}>{identidades === null ? "Consultando..." : conectado ? "Conectada" : "No conectada"}</small><button type="button" className={styles.botonVincular} disabled={identidades === null || vinculando !== null} onClick={() => conectado ? desvincular(proveedor.id) : vincular(proveedor.id)} title={conectado ? `Desvincular ${proveedor.nombre}` : `Vincular ${proveedor.nombre}`} aria-label={conectado ? `Desvincular ${proveedor.nombre}` : `Vincular ${proveedor.nombre}`}>{identidades === null || vinculando === proveedor.id ? "…" : <IconoEnlace roto={!conectado} />}</button></div></div>;
      })}
    </div>
  </section>;
}

export function SeguridadForm() {
  const [cargando, setCargando] = useState(false);
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "exito"; texto: string } | null>(null);
  const requisitos = [
    { texto: "8 caracteres mínimo", valido: password.length >= 8 },
    { texto: "Una letra mayúscula", valido: /[A-Z]/.test(password) },
    { texto: "Un número o símbolo", valido: /[\d\W_]/.test(password) },
  ];
  const puntos = requisitos.filter((requisito) => requisito.valido).length;
  const nivel = puntos < 2 ? "Débil" : puntos < 3 || password.length < 12 ? "Media" : "Fuerte";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMensaje(null);
    const formulario = e.currentTarget; const datos = new FormData(formulario);
    const password = String(datos.get("password") ?? ""); const confirmacion = String(datos.get("confirmacion") ?? "");
    if (password.length < 8) return setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 8 caracteres." });
    if (!/[A-Z]/.test(password)) return setMensaje({ tipo: "error", texto: "Agrega al menos una letra mayúscula a la contraseña." });
    if (!/[\d\W_]/.test(password)) return setMensaje({ tipo: "error", texto: "Agrega al menos un número o símbolo a la contraseña." });
    if (password !== confirmacion) return setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden." });
    setCargando(true); const { error } = await createClient().auth.updateUser({ password }); setCargando(false);
    if (error) return setMensaje({ tipo: "error", texto: error.message });
    formulario.reset(); setPassword(""); setMostrarPassword(false); setMostrarConfirmacion(false); setMensaje({ tipo: "exito", texto: "Tu contraseña se actualizó correctamente." });
  }

  return <form className={styles.formulario} onSubmit={onSubmit}>
    {mensaje && <p className={mensaje.tipo === "error" ? styles.mensajeError : styles.mensajeExito}>{mensaje.texto}</p>}
    <div className={styles.formGrid}>
      <label className={styles.campo}><span>Nueva contraseña</span><div className={styles.campoConIcono}><input name="password" type={mostrarPassword ? "text" : "password"} minLength={8} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" className={styles.botonIconoCampo} aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={mostrarPassword} onClick={() => setMostrarPassword((visible) => !visible)}><IconoOjo tachado={!mostrarPassword} /></button></div><div className={styles.fortalezaPassword} aria-live="polite"><div className={styles.fortalezaBarra} aria-label={`Fortaleza de contraseña: ${nivel}`}><span className={`${styles.fortalezaProgreso} ${styles[`fortaleza${nivel}`]}`} style={{ width: `${password ? (nivel === "Fuerte" ? 100 : nivel === "Media" ? 65 : 30) : 0}%` }} /></div><strong>{password ? nivel : ""}</strong></div><ul className={styles.requisitosPassword}>{requisitos.map((requisito) => <li className={requisito.valido ? styles.requisitoValido : ""} key={requisito.texto}>{requisito.valido ? "✓" : "○"} {requisito.texto}</li>)}</ul></label>
      <label className={styles.campo}><span>Confirmar contraseña</span><div className={styles.campoConIcono}><input name="confirmacion" type={mostrarConfirmacion ? "text" : "password"} minLength={8} autoComplete="new-password" required /><button type="button" className={styles.botonIconoCampo} aria-label={mostrarConfirmacion ? "Ocultar confirmación" : "Mostrar confirmación"} aria-pressed={mostrarConfirmacion} onClick={() => setMostrarConfirmacion((visible) => !visible)}><IconoOjo tachado={!mostrarConfirmacion} /></button></div></label>
    </div>
    <button className={styles.botonPrimario} type="submit" disabled={cargando}>{cargando ? "Actualizando..." : "Actualizar contraseña"}</button>
  </form>;
}

export function SeguridadTabs() {
  const [pestana, setPestana] = useState<"password" | "cuentas">("password");
  return <>
    <div className={styles.pestanasSeguridad} role="tablist" aria-label="Opciones de seguridad">
      <button type="button" role="tab" aria-selected={pestana === "password"} className={pestana === "password" ? styles.pestanaSeguridadActiva : styles.pestanaSeguridad} onClick={() => setPestana("password")}>Cambiar contraseña</button>
      <button type="button" role="tab" aria-selected={pestana === "cuentas"} className={pestana === "cuentas" ? styles.pestanaSeguridadActiva : styles.pestanaSeguridad} onClick={() => setPestana("cuentas")}>Cuentas vinculadas</button>
    </div>
    {pestana === "password" ? <SeguridadForm /> : <CuentasVinculadas />}
  </>;
}
