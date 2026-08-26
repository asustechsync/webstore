"use server";

import { revalidatePath } from "next/cache";
import { ejecutar } from "@/lib/acciones";
import { requirePermiso } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  atributoCatalogoSchema,
  valorAtributoCatalogoSchema,
  type AtributoCatalogoInput,
  type ValorAtributoCatalogoInput,
} from "../schemas/atributos";

function revalidarAtributos(atributoId?: string) {
  if (atributoId) revalidatePath(`/admin/atributos/${atributoId}`);
  revalidatePath("/admin/atributos");
  revalidatePath("/admin/productos");
}

export async function crearAtributoCatalogo(datos: AtributoCatalogoInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const validado = atributoCatalogoSchema.parse(datos);

    await db.atributoCatalogo.create({
      data: {
        nombre: validado.nombre,
        clave: validado.clave,
        tipo: validado.tipo,
        activo: validado.activo,
        valores: { create: validado.valores.map((valor, orden) => ({ valor, orden })) },
      },
    });
    revalidarAtributos();
  });
}

export async function actualizarAtributoCatalogo(id: string, datos: AtributoCatalogoInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const validado = atributoCatalogoSchema.parse(datos);

    await db.atributoCatalogo.update({
      where: { id },
      data: {
        nombre: validado.nombre,
        clave: validado.clave,
        tipo: validado.tipo,
        activo: validado.activo,
      },
    });
    revalidarAtributos();
  });
}

export async function eliminarAtributoCatalogo(id: string) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    await db.atributoCatalogo.delete({ where: { id } });
    revalidarAtributos();
  });
}

export async function crearValorAtributoCatalogo(
  atributoId: string,
  datos: ValorAtributoCatalogoInput,
) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const validado = valorAtributoCatalogoSchema.parse(datos);
    const ultimo = await db.valorAtributoCatalogo.aggregate({
      where: { atributoId },
      _max: { orden: true },
    });
    await db.valorAtributoCatalogo.create({
      data: {
        atributoId,
        valor: validado.valor,
        colorHex: validado.colorHex ?? null,
        orden: (ultimo._max.orden ?? -1) + 1,
      },
    });
    revalidarAtributos(atributoId);
  });
}

export async function actualizarValorAtributoCatalogo(
  atributoId: string,
  id: string,
  datos: ValorAtributoCatalogoInput,
) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const validado = valorAtributoCatalogoSchema.parse(datos);
    const actualizado = await db.valorAtributoCatalogo.updateMany({
      where: { id, atributoId },
      data: { valor: validado.valor, colorHex: validado.colorHex ?? null },
    });
    if (!actualizado.count) throw new Error("No se encontró el valor del atributo");
    revalidarAtributos(atributoId);
  });
}

export async function eliminarValorAtributoCatalogo(atributoId: string, id: string) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const eliminado = await db.valorAtributoCatalogo.deleteMany({ where: { id, atributoId } });
    if (!eliminado.count) throw new Error("No se encontró el valor del atributo");
    revalidarAtributos(atributoId);
  });
}

export async function reordenarValoresAtributoCatalogo(
  atributoId: string,
  idsOrdenados: string[],
) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    await db.$transaction(async (tx) => {
      const valores = await tx.valorAtributoCatalogo.findMany({
        where: { atributoId },
        select: { id: true },
      });
      const idsExistentes = new Set(valores.map(({ id }) => id));
      const ordenValido =
        idsOrdenados.length === valores.length &&
        new Set(idsOrdenados).size === valores.length &&
        idsOrdenados.every((id) => idsExistentes.has(id));

      if (!ordenValido) throw new Error("El orden de valores no es válido");

      await Promise.all(
        idsOrdenados.map((id, orden) =>
          tx.valorAtributoCatalogo.update({ where: { id }, data: { orden } }),
        ),
      );
    });
    revalidarAtributos(atributoId);
  });
}
