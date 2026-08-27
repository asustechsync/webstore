"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarMiPerfil } from "@/features/usuarios/cuenta-actions";
import { DateSelectPicker } from "@/components/ui/DateSelectPicker";
import { Select } from "@/components/ui/Select";
import styles from "../cuenta.module.css";

export function PerfilForm({ perfil }: { perfil: { nombre: string; apellidoPaterno: string; apellidoMaterno: string; telefono: string; codigoPais: string; fechaNacimiento: string; genero: string; tipoDocumento: string; documento: string; email: string } }) {
  const router = useRouter();
  const [form, setForm] = useState(perfil);
  const [pendiente, iniciarTransicion] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "exito"; texto: string } | null>(null);

  function onSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setMensaje(null);
    iniciarTransicion(async () => {
      const resultado = await actualizarMiPerfil({
        nombre: form.nombre,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno,
        telefono: form.telefono,
        codigoPais: form.codigoPais as "+51" | "+56",
        fechaNacimiento: form.fechaNacimiento,
        genero: form.genero as "" | "MASCULINO" | "FEMENINO" | "NO_BINARIO" | "PREFIERO_NO_DECIR",
        tipoDocumento: form.tipoDocumento as "" | "DNI" | "CE" | "PASAPORTE",
        documento: form.documento,
      });
      if (!resultado.ok) return setMensaje({ tipo: "error", texto: resultado.error });
      setMensaje({ tipo: "exito", texto: "Tus datos se actualizaron correctamente." });
      router.refresh();
    });
  }

  return <form className={`${styles.formulario} ${styles.formularioPerfil}`} onSubmit={onSubmit}>
    {mensaje && <p className={mensaje.tipo === "error" ? styles.mensajeError : styles.mensajeExito}>{mensaje.texto}</p>}
    <div className={`${styles.formGrid} ${styles.perfilGrid}`}>
      <label className={styles.campo}><span>Nombres</span><input value={form.nombre} required onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} /></label>
      <label className={styles.campo}><span>Apellido paterno</span><input value={form.apellidoPaterno} required onChange={(e) => setForm((p) => ({ ...p, apellidoPaterno: e.target.value }))} /></label>
      <label className={styles.campo}><span>Apellido materno</span><input value={form.apellidoMaterno} onChange={(e) => setForm((p) => ({ ...p, apellidoMaterno: e.target.value }))} /></label>
      <label className={styles.campo}><span>Correo electrónico</span><input value={form.email} type="email" readOnly aria-describedby="ayuda-correo" /><small id="ayuda-correo">Tu correo también es tu acceso a la tienda.</small></label>
      <div className={styles.campo}><span>Teléfono</span><div className={styles.telefonoGrupo}><Select value={form.codigoPais} ariaLabel="Código de país" onChange={(codigoPais) => setForm((p) => ({ ...p, codigoPais }))} options={[{ valor: "+51", etiqueta: "+51", icono: <span className="fi fi-pe" aria-hidden="true" /> }, { valor: "+56", etiqueta: "+56", icono: <span className="fi fi-cl" aria-hidden="true" /> }]} /><input aria-label="Número de teléfono" value={form.telefono} inputMode="tel" placeholder="Ej.: 987 654 321" onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} /></div></div>
      <div className={styles.campo}><span>Fecha de nacimiento</span><DateSelectPicker value={form.fechaNacimiento} ariaLabel="Fecha de nacimiento" onChange={(fechaNacimiento) => setForm((p) => ({ ...p, fechaNacimiento }))} /></div>
      <div className={styles.campo}><span>Género</span><Select value={form.genero} ariaLabel="Género" onChange={(genero) => setForm((p) => ({ ...p, genero }))} options={[{ valor: "FEMENINO", etiqueta: "Femenino" }, { valor: "MASCULINO", etiqueta: "Masculino" }, { valor: "NO_BINARIO", etiqueta: "No binario" }, { valor: "PREFIERO_NO_DECIR", etiqueta: "Prefiero no decirlo" }]} /></div>
      <div className={styles.campo}><span>Tipo de documento</span><Select value={form.tipoDocumento} ariaLabel="Tipo de documento" onChange={(tipoDocumento) => setForm((p) => ({ ...p, tipoDocumento }))} options={[{ valor: "DNI", etiqueta: "DNI" }, { valor: "CE", etiqueta: "Carné de extranjería" }, { valor: "PASAPORTE", etiqueta: "Pasaporte" }]} /></div>
      <label className={styles.campo}><span>Número de documento</span><input value={form.documento} maxLength={20} placeholder={form.tipoDocumento === "DNI" ? "8 dígitos" : "Número de documento"} onChange={(e) => setForm((p) => ({ ...p, documento: e.target.value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 20) }))} /></label>
    </div>
    <button className={styles.botonPrimario} type="submit" disabled={pendiente}>{pendiente ? "Guardando..." : "Guardar cambios"}</button>
  </form>;
}
