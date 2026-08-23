"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermiso } from "@/lib/auth";
import { ejecutar } from "@/lib/acciones";
import { cuponSchema, type CuponInput } from "./schemas";

export async function crearCupon(datos: CuponInput) {
  return ejecutar(async () => {
    await requirePermiso("cupones.crear");
    const validado = cuponSchema.parse(datos);

    await db.cupon.create({ data: validado });

    revalidatePath("/admin/cupones");
  });
}

export async function actualizarCupon(id: string, datos: CuponInput) {
  return ejecutar(async () => {
    await requirePermiso("cupones.editar");
    const validado = cuponSchema.parse(datos);

    await db.cupon.update({
      where: { id },
      // Prisma trata undefined como "no cambiar", así que los opcionales que
      // el formulario dejó vacíos se mandan explícitamente como null.
      data: {
        ...validado,
        montoMinimo: validado.montoMinimo ?? null,
        usoMaximo: validado.usoMaximo ?? null,
        fechaInicio: validado.fechaInicio ?? null,
        fechaFin: validado.fechaFin ?? null,
      },
    });

    revalidatePath("/admin/cupones");
  });
}

export async function eliminarCupon(id: string) {
  return ejecutar(async () => {
    await requirePermiso("cupones.eliminar");

    // pedidos.cuponId es RESTRICT: un cupón ya usado en un pedido no se
    // puede borrar sin perder ese registro; se desactiva en su lugar.
    const usado = await db.pedido.count({ where: { cuponId: id } });
    if (usado > 0) {
      throw new Error("No se puede eliminar: el cupón ya se usó en pedidos. Desactívalo en su lugar.");
    }

    await db.cupon.delete({ where: { id } });

    revalidatePath("/admin/cupones");
  });
}

export async function alternarActivoCupon(id: string, activo: boolean) {
  return ejecutar(async () => {
    await requirePermiso("cupones.editar");
    await db.cupon.update({ where: { id }, data: { activo } });

    revalidatePath("/admin/cupones");
  });
}
