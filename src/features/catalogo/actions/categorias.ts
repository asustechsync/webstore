"use server";

import { revalidatePath, updateTag } from "next/cache";
import { ejecutar } from "@/lib/acciones";
import { requirePermiso } from "@/lib/auth";
import { db } from "@/lib/db";
import { ETIQUETAS } from "../cache";
import { categoriaSchema, type CategoriaInput } from "../schemas/categorias";

function revalidarCategorias() {
  updateTag(ETIQUETAS.categorias);
  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  revalidatePath("/");
}

export async function crearCategoria(datos: CategoriaInput) {
  return ejecutar(async () => {
    await requirePermiso("categorias.crear");
    const validado = categoriaSchema.parse(datos);
    await db.categoria.create({
      data: { ...validado, destacada: validado.activo && validado.destacada },
    });
    revalidarCategorias();
  });
}

export async function actualizarCategoria(id: string, datos: CategoriaInput) {
  return ejecutar(async () => {
    await requirePermiso("categorias.editar");
    const validado = categoriaSchema.parse(datos);

    let padreId = validado.padreId;
    while (padreId) {
      if (padreId === id) {
        throw new Error("No puedes elegir una subcategoría como categoría padre");
      }
      const padre = await db.categoria.findUnique({
        where: { id: padreId },
        select: { padreId: true },
      });
      padreId = padre?.padreId ?? undefined;
    }

    await db.categoria.update({
      where: { id },
      data: {
        ...validado,
        descripcion: validado.descripcion ?? null,
        imagenUrl: validado.imagenUrl ?? null,
        tituloSeo: validado.tituloSeo ?? null,
        descripcionSeo: validado.descripcionSeo ?? null,
        padreId: validado.padreId ?? null,
        destacada: validado.activo && validado.destacada,
      },
    });
    revalidarCategorias();
  });
}

export async function eliminarCategoria(id: string) {
  return ejecutar(async () => {
    await requirePermiso("categorias.eliminar");

    const productos = await db.producto.count({ where: { categoriaId: id } });
    if (productos > 0) {
      throw new Error(
        `No se puede eliminar: la categoría tiene ${productos} producto(s) asociado(s)`,
      );
    }

    const subcategorias = await db.categoria.count({ where: { padreId: id } });
    if (subcategorias > 0) {
      throw new Error(
        `No se puede eliminar: la categoría tiene ${subcategorias} subcategoría(s). Reasígnalas primero`,
      );
    }

    await db.categoria.delete({ where: { id } });
    revalidarCategorias();
  });
}
