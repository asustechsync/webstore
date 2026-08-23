"use server";

import { revalidatePath } from "next/cache";
import { EstadoPedido } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePermiso } from "@/lib/auth";
import { ejecutar } from "@/lib/acciones";

export async function cambiarEstadoPedido(id: string, estado: EstadoPedido) {
  return ejecutar(async () => {
    await requirePermiso("pedidos.gestionar");

    if (!Object.values(EstadoPedido).includes(estado)) {
      throw new Error("Estado de pedido inválido");
    }

    await db.pedido.update({ where: { id }, data: { estado } });

    revalidatePath("/admin/pedidos");
  });
}
