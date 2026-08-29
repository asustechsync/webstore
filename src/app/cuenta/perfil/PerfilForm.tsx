"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import { actualizarMiPerfil } from "@/features/usuarios/cuenta-actions";
import { DateSelectPicker } from "@/components/ui/DateSelectPicker";
import { Select } from "@/components/ui/Select";
import styles from "../cuenta.module.css";

const PAISES_TELEFONO = getCountries().reduce<{ valor: string; etiqueta: string; icono: React.ReactNode }[]>((opciones, pais) => {
  const codigo = `+${getCountryCallingCode(pais)}`;
  if (opciones.some((opcion) => opcion.valor === codigo)) return opciones;
  opciones.push({ valor: codigo, etiqueta: codigo, icono: <span className={`fi fi-${pais.toLowerCase()}`} aria-hidden="true" /> });
  return opciones;
}, []);

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
        codigoPais: form.codigoPais,
        fechaNacimiento: form.fechaNacimiento,
        genero: form.genero as "" | "MASCULINO" | "FEMENINO" | "NO_BINARIO" | "PREFIERO_NO_DECIR",
        tipoDocumento: form.tipoDocumento as "" | "DNI" | "CE" | "PASAPORTE",
        documento: form.documento,
      });
      if (!resultado.ok) return setMensaje({ tipo: "error", texto: resultado.error });
      setMensaje({ tipo: "exito", texto: "Perfil actualizado." });
      router.refresh();
    });
  }

  return <form className={`${styles.formulario} ${styles.formularioPerfil}`} onSubmit={onSubmit}>
    {mensaje && <p className={mensaje.tipo === "error" ? styles.mensajeError : styles.mensajeExito}>{mensaje.texto}</p>}
    <div className={`${styles.formGrid} ${styles.perfilGrid}`}>
      <label className={styles.campo}><span>Nombres</span><input value={form.nombre} placeholder="Nombres" required onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} /></label>
      <div className={styles.apellidosGrupo}>
        <label className={styles.campo}><span>Apellido paterno</span><input value={form.apellidoPaterno} placeholder="Apellido" required onChange={(e) => setForm((p) => ({ ...p, apellidoPaterno: e.target.value }))} /></label>
        <label className={styles.campo}><span>Apellido materno</span><input value={form.apellidoMaterno} placeholder="Apellido" onChange={(e) => setForm((p) => ({ ...p, apellidoMaterno: e.target.value }))} /></label>
      </div>
      <label className={styles.campo}><span>Correo electrónico</span><input value={form.email} type="email" placeholder="Correo electrónico" readOnly aria-describedby="ayuda-correo" /><small id="ayuda-correo">Tu correo también es tu acceso a la tienda.</small></label>
      <div className={styles.campo}><span>Teléfono</span><div className={styles.telefonoGrupo}><Select value={form.codigoPais} ariaLabel="Código de país" buscable onChange={(codigoPais) => setForm((p) => ({ ...p, codigoPais }))} options={PAISES_TELEFONO} /><input aria-label="Número de teléfono" value={form.telefono} inputMode="tel" placeholder="N.º de celular" onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} /></div></div>
      <div className={styles.campo}><span>Fecha de nacimiento</span><DateSelectPicker value={form.fechaNacimiento} ariaLabel="Fecha de nacimiento" onChange={(fechaNacimiento) => setForm((p) => ({ ...p, fechaNacimiento }))} /></div>
      <div className={styles.campo}><span>Género</span><Select value={form.genero} ariaLabel="Género" placeholder="Selecciona una opción" onChange={(genero) => setForm((p) => ({ ...p, genero }))} options={[{ valor: "", etiqueta: "Selecciona una opción" }, { valor: "FEMENINO", etiqueta: "Femenino" }, { valor: "MASCULINO", etiqueta: "Masculino" }]} /></div>
      <div className={styles.documentoGrupo}>
        <div className={styles.campo}><span>Tipo de documento</span><Select value={form.tipoDocumento} ariaLabel="Tipo de documento" placeholder="Elegir" onChange={(tipoDocumento) => setForm((p) => ({ ...p, tipoDocumento }))} options={[{ valor: "", etiqueta: "Elegir" }, { valor: "DNI", etiqueta: "DNI" }, { valor: "CE", etiqueta: "Carné de extranjería", etiquetaMovil: "C.E." }, { valor: "PASAPORTE", etiqueta: "Pasaporte", etiquetaMovil: "PAS" }]} /></div>
        <label className={styles.campo}><span>Número de documento</span><input value={form.documento} maxLength={20} placeholder={form.tipoDocumento === "DNI" ? "8 dígitos" : "N.º de documento"} onChange={(e) => setForm((p) => ({ ...p, documento: e.target.value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 20) }))} /></label>
      </div>
    </div>
    <button className={styles.botonSecundario} type="submit" disabled={pendiente}>{pendiente ? "Guardando..." : "Guardar cambios"}</button>
  </form>;
}
