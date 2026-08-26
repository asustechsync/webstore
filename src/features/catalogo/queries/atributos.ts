import { db } from "@/lib/db";

export function listarAtributosAdmin() {
  return db.atributoCatalogo.findMany({
    orderBy: { nombre: "asc" },
    include: { valores: { orderBy: { orden: "asc" } } },
  });
}
