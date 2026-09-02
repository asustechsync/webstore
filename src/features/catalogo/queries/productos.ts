import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const PRODUCTOS_POR_PAGINA = 24;
const PRODUCTOS_PORTADA = 8;

/**
 * Datos mínimos que necesita ProductoCard. Todas las consultas del catálogo
 * lo reutilizan para que las tarjetas reciban siempre la misma forma.
 */
const incluirTarjeta = {
  imagenes: { orderBy: { orden: "asc" }, take: 1 },
  marca: true,
  variantes: {
    where: { activo: true },
    orderBy: [{ color: "asc" }, { talla: "asc" }],
    select: { id: true, sku: true, talla: true, color: true, precio: true },
  },
} satisfies Prisma.ProductoInclude;

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
      include: incluirTarjeta,
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

/** Últimos productos publicados, para la sección "Nuevos ingresos". */
export function listarNuevosIngresos(limite = PRODUCTOS_PORTADA) {
  return db.producto.findMany({
    where: { activo: true },
    include: incluirTarjeta,
    orderBy: { creadoEn: "desc" },
    take: limite,
  });
}

/**
 * Productos con precio rebajado vigente. La comparación entre columnas la
 * resuelve la base de datos, así el límite devuelve ofertas reales.
 */
export function listarOfertas(limite = PRODUCTOS_PORTADA) {
  return db.producto.findMany({
    where: {
      activo: true,
      precioOferta: { not: null, lt: db.producto.fields.precio },
    },
    include: incluirTarjeta,
    orderBy: { actualizadoEn: "desc" },
    take: limite,
  });
}

/** Total de productos publicados, para los datos de la portada. */
export function contarProductosActivos() {
  return db.producto.count({ where: { activo: true } });
}

/** Productos marcados como destacados por el administrador. */
export function listarDestacados(limite = 4) {
  return db.producto.findMany({
    where: { activo: true, destacado: true },
    include: incluirTarjeta,
    orderBy: { actualizadoEn: "desc" },
    take: limite,
  });
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
