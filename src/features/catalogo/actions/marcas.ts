"use server";

import { revalidatePath } from "next/cache";
import { ejecutar } from "@/lib/acciones";
import { requirePermiso } from "@/lib/auth";
import { db } from "@/lib/db";
import { marcaSchema, type MarcaInput } from "../schemas/marcas";

export async function crearMarca(datos: MarcaInput) {
  return ejecutar(async () => {
    await requirePermiso("marcas.crear");
    const validado = marcaSchema.parse(datos);
    await db.marca.create({ data: validado });
    revalidatePath("/admin/marcas");
  });
}

export async function actualizarMarca(id: string, datos: MarcaInput) {
  return ejecutar(async () => {
    await requirePermiso("marcas.editar");
    const validado = marcaSchema.parse(datos);
    await db.marca.update({
      where: { id },
      data: { ...validado, logoUrl: validado.logoUrl ?? null },
    });
    revalidatePath("/admin/marcas");
  });
}

export async function eliminarMarca(id: string) {
  return ejecutar(async () => {
    await requirePermiso("marcas.eliminar");
    await db.marca.delete({ where: { id } });
    revalidatePath("/admin/marcas");
    revalidatePath("/admin/productos");
  });
}
