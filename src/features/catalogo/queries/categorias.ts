import { db } from "@/lib/db";

export function listarCategorias(opciones: { soloDestacadas?: boolean } = {}) {
  return db.categoria.findMany({
    where: {
      activo: true,
      ...(opciones.soloDestacadas ? { destacada: true } : {}),
    },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    include: { _count: { select: { productos: true } } },
  });
}

export function obtenerCategoriaPorSlug(slug: string) {
  return db.categoria.findUnique({ where: { slug, activo: true } });
}

export function listarCategoriasAdmin() {
  return db.categoria.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    include: { _count: { select: { productos: true } } },
  });
}
