"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermiso } from "@/lib/auth";
import { productoSchema, type ProductoInput } from "./schemas";

export async function crearProducto(datos: ProductoInput) {
  await requirePermiso("productos.crear");
  const validado = productoSchema.parse(datos);

  const producto = await db.producto.create({ data: validado });

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return producto;
}

export async function actualizarProducto(id: string, datos: ProductoInput) {
  await requirePermiso("productos.editar");
  const validado = productoSchema.parse(datos);

  const producto = await db.producto.update({ where: { id }, data: validado });

  revalidatePath("/admin/productos");
  revalidatePath(`/productos/${producto.slug}`);
  return producto;
}

export async function eliminarProducto(id: string) {
  await requirePermiso("productos.eliminar");
  await db.producto.delete({ where: { id } });

  revalidatePath("/admin/productos");
}
