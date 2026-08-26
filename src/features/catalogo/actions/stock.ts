"use server";

import { revalidatePath } from "next/cache";
import { ejecutar } from "@/lib/acciones";
import { requirePermiso } from "@/lib/auth";
import { db } from "@/lib/db";
import { ajusteStockSchema, type AjusteStockInput } from "../schemas/stock";

export async function ajustarStock(varianteId: string, datos: AjusteStockInput) {
  return ejecutar(async () => {
    await requirePermiso("stock.editar");
    const validado = ajusteStockSchema.parse(datos);

    await db.variante.update({ where: { id: varianteId }, data: validado });

    revalidatePath("/admin/stock");
    revalidatePath("/admin");
  });
}
