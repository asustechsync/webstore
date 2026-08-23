import { db } from "@/lib/db";

const PRODUCTOS_POR_PAGINA = 24;

export async function listarProductos(opciones: {
  pagina?: number;
  categoriaSlug?: string;
  marcaSlug?: string;
} = {}) {
  const { pagina = 1, categoriaSlug, marcaSlug } = opciones;

  const where = {
    activo: true,
    ...(categoriaSlug ? { categoria: { slug: categoriaSlug } } : {}),
    ...(marcaSlug ? { marca: { slug: marcaSlug } } : {}),
  };

  const [productos, total] = await Promise.all([
    db.producto.findMany({
      where,
      include: { imagenes: { orderBy: { orden: "asc" }, take: 1 }, marca: true },
      orderBy: { creadoEn: "desc" },
      skip: (pagina - 1) * PRODUCTOS_POR_PAGINA,
      take: PRODUCTOS_POR_PAGINA,
    }),
    db.producto.count({ where }),
  ]);

  return {
    productos,
    total,
    totalPaginas: Math.ceil(total / PRODUCTOS_POR_PAGINA),
  };
}

export function obtenerProductoPorSlug(slug: string) {
  return db.producto.findUnique({
    where: { slug, activo: true },
    include: {
      imagenes: { orderBy: { orden: "asc" } },
      categoria: true,
      marca: true,
      // Solo las tallas activas: son las que el cliente puede elegir.
      variantes: { where: { activo: true }, orderBy: [{ color: "asc" }, { talla: "asc" }] },
    },
  });
}
