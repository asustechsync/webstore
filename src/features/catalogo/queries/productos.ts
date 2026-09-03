import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  ORDENES,
  ORDEN_POR_DEFECTO,
  ordenarTallas,
  type FiltrosCatalogo,
} from "@/features/catalogo/filtros";

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
    select: { id: true, sku: true, talla: true, color: true, precio: true, imagenUrl: true },
  },
} satisfies Prisma.ProductoInclude;

/** Producto rebajado de verdad: la comparación entre columnas la hace la base. */
const enOferta = { precioOferta: { not: null, lt: db.producto.fields.precio } };

type Filtros = Partial<FiltrosCatalogo>;

/**
 * Condiciones que debe cumplir una misma variante.
 *
 * Talla, color y stock se agrupan en un único objeto porque van juntos en un
 * `some`: si se separaran, un producto con talla M agotada y talla L
 * disponible pasaría el filtro "talla M + disponible" aunque esa combinación
 * concreta no exista.
 */
function condicionVariante(filtros: Filtros): Prisma.VarianteWhereInput {
  const { tallas = [], colores = [], soloDisponibles } = filtros;

  return {
    activo: true,
    ...(tallas.length ? { talla: { in: tallas } } : {}),
    ...(colores.length ? { color: { in: colores } } : {}),
    ...(soloDisponibles ? { cantidad: { gt: 0 } } : {}),
  };
}

function filtraVariantes(filtros: Filtros) {
  return Boolean(filtros.tallas?.length || filtros.colores?.length || filtros.soloDisponibles);
}

/** Traduce los filtros de la tienda a un `where` de Prisma. */
function construirWhere(filtros: Filtros): Prisma.ProductoWhereInput {
  const { categoria, marca, precioMin, precioMax, soloOfertas } = filtros;

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    ...(categoria ? { categoria: { slug: categoria } } : {}),
    ...(marca ? { marca: { slug: marca } } : {}),
    ...(soloOfertas ? enOferta : {}),
    ...(filtraVariantes(filtros) ? { variantes: { some: condicionVariante(filtros) } } : {}),
  };

  // El rango se aplica sobre el precio que el cliente ve en la tarjeta: el de
  // oferta cuando existe y el normal cuando no.
  if (precioMin != null || precioMax != null) {
    const rango = {
      ...(precioMin != null ? { gte: precioMin } : {}),
      ...(precioMax != null ? { lte: precioMax } : {}),
    };
    where.OR = [{ precioOferta: null, precio: rango }, { precioOferta: rango }];
  }

  return where;
}

export async function listarProductos(
  filtros: Filtros & { porPagina?: number } = {},
) {
  const { pagina = 1, orden = ORDEN_POR_DEFECTO, porPagina = PRODUCTOS_POR_PAGINA } = filtros;
  const where = construirWhere(filtros);

  // La tienda pinta una tarjeta por variante, así que el producto solo debe
  // traer las que coinciden: si no, filtrar por "Negro" seguiría mostrando la
  // tarjeta blanca del mismo producto y el filtro parecería no funcionar.
  const include = {
    ...incluirTarjeta,
    variantes: { ...incluirTarjeta.variantes, where: condicionVariante(filtros) },
  };

  const [productos, total] = await Promise.all([
    db.producto.findMany({
      where,
      include,
      // El segundo criterio desempata: sin él, dos productos del mismo precio
      // pueden intercambiarse entre páginas y aparecer repetidos o perdidos.
      orderBy: [ORDENES[orden].orderBy, { id: "asc" }],
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    db.producto.count({ where }),
  ]);

  return {
    productos,
    total,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
  };
}

/**
 * Opciones que el panel de filtros puede ofrecer.
 *
 * Se calculan sobre el alcance de la página (la categoría o la marca de la
 * ruta) y no sobre la selección actual: si dependieran de los filtros ya
 * aplicados, marcar "talla M" haría desaparecer el resto de tallas y el
 * usuario no podría cambiar de opinión sin limpiar todo.
 */
export async function listarFacetas(alcance: { categoria?: string; marca?: string } = {}) {
  const where = construirWhere(alcance);
  const enElAlcance: Prisma.VarianteWhereInput = { activo: true, producto: where };

  const [tallas, colores, precios, marcas, categorias] = await Promise.all([
    db.variante.findMany({
      where: { ...enElAlcance, talla: { not: "" } },
      select: { talla: true },
      distinct: ["talla"],
    }),
    db.variante.findMany({
      where: { ...enElAlcance, color: { not: "" } },
      select: { color: true },
      distinct: ["color"],
      orderBy: { color: "asc" },
    }),
    db.producto.aggregate({ where, _min: { precio: true }, _max: { precio: true } }),
    alcance.marca
      ? []
      : db.marca.findMany({
          where: { activo: true, productos: { some: where } },
          select: { nombre: true, slug: true },
          orderBy: { nombre: "asc" },
        }),
    alcance.categoria
      ? []
      : db.categoria.findMany({
          where: { activo: true, productos: { some: where } },
          select: { nombre: true, slug: true },
          orderBy: [{ orden: "asc" }, { nombre: "asc" }],
        }),
  ]);

  return {
    tallas: ordenarTallas(tallas.map((variante) => variante.talla)),
    colores: colores.map((variante) => variante.color),
    marcas,
    categorias,
    // Decimal no viaja a un componente cliente; se redondea al sol para que
    // los campos del rango muestren números enteros.
    precioMin: precios._min.precio != null ? Math.floor(Number(precios._min.precio)) : 0,
    precioMax: precios._max.precio != null ? Math.ceil(Number(precios._max.precio)) : 0,
  };
}

export type Facetas = Awaited<ReturnType<typeof listarFacetas>>;

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
    where: { activo: true, ...enOferta },
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
