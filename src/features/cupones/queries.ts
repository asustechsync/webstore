import { db } from "@/lib/db";

export function listarCuponesAdmin() {
  return db.cupon.findMany({ orderBy: { creadoEn: "desc" } });
}
