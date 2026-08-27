"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cambiarRolUsuario, editarUsuario, eliminarUsuario } from "@/features/usuarios/actions";
import styles from "../admin.module.css";
import { IconoEditar, IconoEliminar } from "@/components/ui/ActionIcons";
import { SelectConFlecha } from "@/components/ui/SelectConFlecha";

type Fila = {
  id: string;
  nombre: string;
  email: string;
  rolId: string;
  creadoEn: string;
};

type Rol = { id: string; nombre: string };

export function UsuariosTabla({
  usuarios,
  roles,
  usuarioActualId,
}: {
  usuarios: Fila[];
  roles: Rol[];
  usuarioActualId: string;
}) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", email: "" });

  function empezarEdicion(usuario: Fila) {
    setEditandoId(usuario.id);
    setForm({ nombre: usuario.nombre, email: usuario.email });
    setError(null);
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setError(null);
  }

  function onGuardarEdicion(id: string) {
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await editarUsuario(id, form);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setEditandoId(null);
      router.refresh();
    });
  }

  function onCambiarRol(id: string, rolId: string) {
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await cambiarRolUsuario(id, rolId);
      if (!resultado.ok) setError(resultado.error);
      router.refresh();
    });
  }

  function onEliminar(usuario: Fila) {
    if (!confirm(`¿Eliminar la cuenta de ${usuario.email}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setError(null);
    iniciarTransicion(async () => {
      const resultado = await eliminarUsuario(usuario.id);
      if (!resultado.ok) setError(resultado.error);
      router.refresh();
    });
  }

  if (usuarios.length === 0) {
    return <p className={styles.vacio}>Todavía no hay usuarios registrados.</p>;
  }

  return (
    <>
      {error && <p className={styles.mensajeError}>{error}</p>}

      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Registrado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => {
              const enEdicion = editandoId === usuario.id;

              return (
                <tr key={usuario.id}>
                  <td>
                    {enEdicion ? (
                      <input
                        className={styles.control}
                        value={form.nombre}
                        required
                        onChange={(evento) =>
                          setForm((previo) => ({ ...previo, nombre: evento.target.value }))
                        }
                      />
                    ) : (
                      usuario.nombre
                    )}
                  </td>
                  <td>
                    {enEdicion ? (
                      <input
                        className={styles.control}
                        type="email"
                        value={form.email}
                        required
                        onChange={(evento) =>
                          setForm((previo) => ({ ...previo, email: evento.target.value }))
                        }
                      />
                    ) : (
                      usuario.email
                    )}
                  </td>
                  <td>
                    <SelectConFlecha
                      className={styles.control}
                      value={usuario.rolId}
                      disabled={pendiente}
                      onChange={(evento) => onCambiarRol(usuario.id, evento.target.value)}
                    >
                      {roles.map((rol) => (
                        <option key={rol.id} value={rol.id}>
                          {rol.nombre}
                        </option>
                      ))}
                    </SelectConFlecha>
                  </td>
                  <td>{usuario.creadoEn}</td>
                  <td>
                    <div className={styles.acciones}>
                      {enEdicion ? (
                        <>
                          <button
                            type="button"
                            className={styles.botonIcono}
                            disabled={pendiente}
                            title="Editar"
                            aria-label={`Editar ${usuario.email}`}
                            onClick={() => onGuardarEdicion(usuario.id)}
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            className={styles.botonChico}
                            disabled={pendiente}
                            onClick={cancelarEdicion}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className={styles.botonChico}
                            disabled={pendiente}
                            onClick={() => empezarEdicion(usuario)}
                          >
                            <IconoEditar />
                          </button>
                          {usuario.id === usuarioActualId ? (
                            <span className={styles.badge}>Tu cuenta</span>
                          ) : (
                            <button
                              type="button"
                              className={styles.botonIcono}
                              disabled={pendiente}
                              title="Eliminar"
                              aria-label={`Eliminar ${usuario.email}`}
                              onClick={() => onEliminar(usuario)}
                            >
                              <IconoEliminar />
                            </button>
                          )}
                        </>
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
