"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconoOjo } from "@/components/ui/IconoOjo";
import styles from "../cuenta.module.css";

const PROVEEDORES = [
  { id: "google", nombre: "Google" },
  { id: "azure", nombre: "Microsoft" },
  { id: "facebook", nombre: "Facebook" },
] as const;

export function CuentasVinculadas() {
  const [vinculados, setVinculados] = useState<string[] | null>(null);
  const [vinculando, setVinculando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    createClient().auth.getUser().then(({ data }) => {
      if (activo) setVinculados(data.user?.identities?.map((identidad) => identidad.provider) ?? []);
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

  return <section className={styles.cuentasVinculadas} aria-labelledby="cuentas-vinculadas-titulo">
    <div><h3 id="cuentas-vinculadas-titulo">Cuentas vinculadas</h3><p>Consulta los métodos asociados a tu cuenta.</p></div>
    {error && <p className={styles.mensajeError}>{error}</p>}
    <div className={styles.listaVinculadas}>
      {PROVEEDORES.map((proveedor) => {
        const conectado = vinculados?.includes(proveedor.id) ?? false;
        return <div className={styles.cuentaVinculada} key={proveedor.id}><span>{proveedor.nombre}</span><div className={styles.estadoVinculada}><small className={conectado ? styles.vinculadaActiva : ""}>{vinculados === null ? "Consultando..." : conectado ? "Vinculada" : "No vinculada"}</small>{!conectado && vinculados !== null && <button type="button" className={styles.botonVincular} disabled={vinculando !== null} onClick={() => vincular(proveedor.id)}>{vinculando === proveedor.id ? "Redirigiendo..." : "Vincular"}</button>}</div></div>;
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
