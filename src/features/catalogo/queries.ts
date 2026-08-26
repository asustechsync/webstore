import { db } from "@/lib/db";

const PRODUCTOS_POR_PAGINA = 24;

export async function listarProductos(opciones: {
  pagina?: number;
  categoriaSlug?: string;
  marcaSlug?: string;
  porPagina?: number;
} = {}) {
  const { pagina = 1, categoriaSlug, marcaSlug, porPagina = PRODUCTOS_POR_PAGINA } = opciones;

  const where = {
    activo: true,
    ...(categoriaSlug ? { categoria: { slug: categoriaSlug } } : {}),
    ...(marcaSlug ? { marca: { slug: marcaSlug } } : {}),
  };

  const [productos, total] = await Promise.all([
    db.producto.findMany({
      where,
      include: {
        imagenes: { orderBy: { orden: "asc" }, take: 1 },
        marca: true,
        variantes: {
          where: { activo: true },
          orderBy: [{ color: "asc" }, { talla: "asc" }],
          select: { id: true, sku: true, talla: true, color: true, precio: true },
        },
      },
      orderBy: { creadoEn: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    db.producto.count({ where }),
  ]);

  return {
    productos,
    total,
    totalPaginas: Math.ceil(total / porPagina),
  };
}

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

export function obtenerProductoPorSlug(slug: string) {
  return db.producto.findUnique({
    where: { slug, activo: true },
    include: {
      imagenes: { orderBy: { orden: "asc" } },
      categoria: true,
      marca: true,
      opciones: {
        orderBy: { orden: "asc" },
        include: { valores: { orderBy: { orden: "asc" } } },
      },
      // Cada variante ya incluye los valores exactos que el cliente elegirá.
      variantes: {
        where: { activo: true },
        orderBy: [{ color: "asc" }, { talla: "asc" }],
        include: { valores: { include: { valor: { include: { opcion: true } } } } },
      },
    },
  });
}
