"use server";

import { revalidatePath } from "next/cache";
import { ejecutar } from "@/lib/acciones";
import { getUsuarioActual, NoAutorizadoError } from "@/lib/auth";
import { db } from "@/lib/db";
import { direccionSchema, editarPerfilSchema, type DireccionInput, type EditarPerfilInput } from "./schemas";

async function requireUsuarioActual() {
  const usuario = await getUsuarioActual();
  if (!usuario) throw new NoAutorizadoError("Debes iniciar sesión");
  return usuario;
}

export async function actualizarMiPerfil(datos: EditarPerfilInput) {
  return ejecutar(async () => {
    const usuario = await requireUsuarioActual();
    const validado = editarPerfilSchema.parse(datos);
    await db.usuario.update({ where: { id: usuario.id }, data: {
      nombre: validado.nombre,
      apellidoPaterno: validado.apellidoPaterno || null,
      apellidoMaterno: validado.apellidoMaterno || null,
      telefono: validado.telefono || null,
      codigoPais: validado.codigoPais,
      fechaNacimiento: validado.fechaNacimiento ? new Date(`${validado.fechaNacimiento}T00:00:00.000Z`) : null,
      genero: validado.genero || null,
      tipoDocumento: validado.tipoDocumento || null,
      documento: validado.documento.toUpperCase() || null,
    } });
    revalidatePath("/cuenta", "layout");
  });
}

export async function guardarMiDireccion(id: string | null, datos: DireccionInput) {
  return ejecutar(async () => {
    const usuario = await requireUsuarioActual();
    const validado = direccionSchema.parse(datos);
    const existentes = await db.direccion.count({ where: { usuarioId: usuario.id } });
    const predeterminada = validado.predeterminada || existentes === 0;

    if (id) {
      const direccion = await db.direccion.findFirst({ where: { id, usuarioId: usuario.id }, select: { id: true } });
      if (!direccion) throw new Error("La dirección ya no existe");
    }

    await db.$transaction(async (tx) => {
      if (predeterminada) {
        await tx.direccion.updateMany({ where: { usuarioId: usuario.id }, data: { predeterminada: false } });
      }
      if (id) {
        await tx.direccion.update({ where: { id }, data: { ...validado, telefono: "", destinatario: "", predeterminada } });
      } else {
        await tx.direccion.create({ data: { ...validado, telefono: "", destinatario: "", predeterminada, usuarioId: usuario.id } });
      }
    });

    revalidatePath("/cuenta");
    revalidatePath("/cuenta/direcciones");
  });
}

export async function eliminarMiDireccion(id: string) {
  return ejecutar(async () => {
    const usuario = await requireUsuarioActual();
    const direccion = await db.direccion.findFirst({ where: { id, usuarioId: usuario.id } });
    if (!direccion) throw new Error("La dirección ya no existe");

    await db.$transaction(async (tx) => {
      await tx.direccion.delete({ where: { id } });
      if (direccion.predeterminada) {
        const siguiente = await tx.direccion.findFirst({ where: { usuarioId: usuario.id }, orderBy: { creadoEn: "desc" }, select: { id: true } });
        if (siguiente) await tx.direccion.update({ where: { id: siguiente.id }, data: { predeterminada: true } });
      }
    });

    revalidatePath("/cuenta");
    revalidatePath("/cuenta/direcciones");
  });
}
