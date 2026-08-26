import { db } from "@/lib/db";

export function listarMarcasAdmin() {
  return db.marca.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true } } },
  });
}
