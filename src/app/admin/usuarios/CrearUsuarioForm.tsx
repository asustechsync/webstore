"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearUsuario } from "@/features/usuarios/actions";
import styles from "../admin.module.css";

type Rol = { id: string; nombre: string };

const VACIO = { nombre: "", email: "", rolId: "" };

export function CrearUsuarioForm({ roles }: { roles: Rol[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [pendiente, iniciarTransicion] = useTransition();
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  function onSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);
    setExito(null);

    iniciarTransicion(async () => {
      const resultado = await crearUsuario(form);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }

      setForm(VACIO);
      setExito(`Se envió una invitación a ${form.email}.`);
      router.refresh();
    });
  }

  if (!abierto) {
    return (
      <button type="button" className={styles.boton} onClick={() => setAbierto(true)}>
        Nuevo usuario
      </button>
    );
  }

  return (
    <section className={styles.seccion}>
      <h2 className={styles.titulo}>Invitar usuario</h2>
      <p className={styles.bloqueAyuda}>
        Se le envía un correo para que defina su propia contraseña; ideal para dar de alta
        vendedores, almacén u otro admin.
      </p>

      <form className={styles.form} onSubmit={onSubmit}>
        {error && <p className={styles.mensajeError}>{error}</p>}
        {exito && <p className={styles.mensajeExito}>{exito}</p>}

        <label className={styles.campo}>
          <span className={styles.etiqueta}>Nombre</span>
          <input
            className={styles.control}
            value={form.nombre}
            required
            onChange={(evento) => setForm((previo) => ({ ...previo, nombre: evento.target.value }))}
          />
        </label>

        <label className={styles.campo}>
          <span className={styles.etiqueta}>Correo</span>
          <input
            className={styles.control}
            type="email"
            value={form.email}
            required
            onChange={(evento) => setForm((previo) => ({ ...previo, email: evento.target.value }))}
          />
        </label>

        <label className={styles.campo}>
          <span className={styles.etiqueta}>Rol</span>
          <select
            className={styles.control}
            value={form.rolId}
            required
            onChange={(evento) => setForm((previo) => ({ ...previo, rolId: evento.target.value }))}
          >
            <option value="">Selecciona un rol</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.botones}>
          <button type="submit" className={styles.boton} disabled={pendiente}>
            {pendiente ? "Enviando..." : "Enviar invitación"}
          </button>
          <button
            type="button"
            className={styles.botonSecundario}
            onClick={() => {
              setAbierto(false);
              setForm(VACIO);
              setError(null);
              setExito(null);
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
