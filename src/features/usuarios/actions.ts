"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermiso } from "@/lib/auth";
import { ejecutar } from "@/lib/acciones";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  crearUsuarioSchema,
  editarUsuarioSchema,
  type CrearUsuarioInput,
  type EditarUsuarioInput,
} from "./schemas";

// Invita por correo en vez de fijar una contraseña temporal: la persona
// define la suya propia al aceptar la invitación, así el admin nunca la
// conoce. El trigger `handle_new_user` crea la fila en `usuarios` apenas se
// registra la cuenta en Supabase Auth (ver prisma/trigger_crear_usuario.sql).
export async function crearUsuario(datos: CrearUsuarioInput) {
  return ejecutar(async () => {
    await requirePermiso("usuarios.gestionar");
    const validado = crearUsuarioSchema.parse(datos);

    const rol = await db.rol.findUnique({ where: { id: validado.rolId } });
    if (!rol) throw new Error("El rol seleccionado ya no existe");

    const yaExiste = await db.usuario.findUnique({ where: { email: validado.email } });
    if (yaExiste) throw new Error("Ya existe una cuenta con ese correo");

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(validado.email, {
      data: { nombre: validado.nombre },
    });
    if (error || !data.user) {
      throw new Error(`No se pudo invitar al usuario: ${error?.message ?? "error desconocido"}`);
    }

    // El trigger le asignó el rol CLIENTE por defecto; si se pidió otro rol,
    // se corrige acá.
    if (rol.nombre !== "CLIENTE") {
      await db.usuario.update({ where: { authId: data.user.id }, data: { rolId: rol.id } });
    }

    revalidatePath("/admin/usuarios");
  });
}

export async function eliminarUsuario(id: string) {
  return ejecutar(async () => {
    const admin = await requirePermiso("usuarios.gestionar");

    if (admin.id === id) {
      throw new Error("No puedes eliminar tu propia cuenta");
    }

    const usuario = await db.usuario.findUnique({ where: { id } });
    if (!usuario) throw new Error("El usuario ya no existe");

    // pedidos.usuarioId es RESTRICT: si tiene pedidos hay que conservar el
    // usuario para no perder el historial de compras.
    const pedidos = await db.pedido.count({ where: { usuarioId: id } });
    if (pedidos > 0) {
      throw new Error(
        `No se puede eliminar: el usuario tiene ${pedidos} pedido(s). Cámbialo de rol en su lugar.`,
      );
    }

    // Se borra primero la fila propia (falla rápido si hay dependencias) y
    // recién después la cuenta de Supabase Auth, que no tiene FK hacia acá.
    await db.usuario.delete({ where: { id } });

    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(usuario.authId);
    if (error) {
      throw new Error(`El usuario se quitó de la tienda, pero su cuenta de acceso sigue activa: ${error.message}`);
    }

    revalidatePath("/admin/usuarios");
  });
}

export async function editarUsuario(id: string, datos: EditarUsuarioInput) {
  return ejecutar(async () => {
    await requirePermiso("usuarios.gestionar");
    const validado = editarUsuarioSchema.parse(datos);

    const usuario = await db.usuario.findUnique({ where: { id } });
    if (!usuario) throw new Error("El usuario ya no existe");

    // El correo es también la credencial de acceso: si cambia, hay que
    // actualizarlo primero en Supabase Auth (falla rápido si ya está en uso
    // por otra cuenta) antes de tocar nuestra propia tabla.
    if (validado.email !== usuario.email) {
      const supabase = createAdminClient();
      const { error } = await supabase.auth.admin.updateUserById(usuario.authId, {
        email: validado.email,
        email_confirm: true,
      });
      if (error) {
        throw new Error(`No se pudo actualizar el correo de acceso: ${error.message}`);
      }
    }

    await db.usuario.update({ where: { id }, data: validado });

    revalidatePath("/admin/usuarios");
  });
}

export async function cambiarRolUsuario(id: string, rolId: string) {
  return ejecutar(async () => {
    const admin = await requirePermiso("usuarios.gestionar");

    const rol = await db.rol.findUnique({ where: { id: rolId } });
    if (!rol) throw new Error("El rol seleccionado ya no existe");

    // Quitarse a uno mismo el rol ADMIN dejaría el panel inaccesible.
    if (admin.id === id && rol.nombre !== "ADMIN") {
      throw new Error("No puedes quitarte a ti mismo el rol de administrador");
    }

    await db.usuario.update({ where: { id }, data: { rolId } });

    revalidatePath("/admin/usuarios");
  });
}
