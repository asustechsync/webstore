import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { ETIQUETAS, VIDA_CATALOGO } from "../cache";

/*
 * Las dos consultas públicas van cacheadas: son iguales para todo el mundo y
 * las pide cada visita a la portada. El panel usa `listarCategoriasAdmin`,
 * que se deja sin caché para que el administrador vea siempre lo último.
 */
export async function listarCategorias(opciones: { soloDestacadas?: boolean } = {}) {
  "use cache";
  // Depende del conteo de productos, así que también caduca al tocar productos.
  cacheTag(ETIQUETAS.categorias, ETIQUETAS.productos);
  cacheLife(VIDA_CATALOGO);

  return db.categoria.findMany({
    where: {
      activo: true,
      ...(opciones.soloDestacadas ? { destacada: true } : {}),
    },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    include: { _count: { select: { productos: true } } },
  });
}

export async function obtenerCategoriaPorSlug(slug: string) {
  "use cache";
  cacheTag(ETIQUETAS.categorias);
  cacheLife(VIDA_CATALOGO);

  return db.categoria.findUnique({ where: { slug, activo: true } });
}

export function listarCategoriasAdmin() {
  return db.categoria.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    include: { _count: { select: { productos: true } } },
  });
}
