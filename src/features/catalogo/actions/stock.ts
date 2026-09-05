"use server";

import { revalidatePath, updateTag } from "next/cache";
import { ejecutar } from "@/lib/acciones";
import { requirePermiso } from "@/lib/auth";
import { db } from "@/lib/db";
import { ETIQUETAS } from "../cache";
import { ETIQUETAS_ADMIN } from "@/features/admin/cache";
import { ajusteStockSchema, type AjusteStockInput } from "../schemas/stock";

export async function ajustarStock(varianteId: string, datos: AjusteStockInput) {
  return ejecutar(async () => {
    await requirePermiso("stock.editar");
    const validado = ajusteStockSchema.parse(datos);

    const variante = await db.variante.update({
      where: { id: varianteId },
      data: validado,
      select: { producto: { select: { slug: true } } },
    });

    // La ficha muestra stock y ahora es HTML pre-construido: además de tirar
    // el caché de datos hay que regenerar esa página.
    updateTag(ETIQUETAS.productos);
    updateTag(ETIQUETAS_ADMIN.dashboard);
    revalidatePath(`/productos/${variante.producto.slug}`);
    revalidatePath("/admin/stock");
    revalidatePath("/admin");
  });
}
