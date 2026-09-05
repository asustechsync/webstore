import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ETIQUETAS, VIDA_CATALOGO } from "@/features/catalogo/cache";
import {
  ORDENES,
  ORDEN_POR_DEFECTO,
  ordenarTallas,
  type FiltrosCatalogo,
} from "@/features/catalogo/filtros";

/**
 * Marca una consulta del catálogo como cacheable.
 *
 * Todo lo que se lee acá es público y no depende de quién mire, así que se
 * guarda una vez y se sirve a todos. Bajo Cache Components esto es además lo
 * que permite prerenderizar la página: sin un tiempo de vida declarado, Next
 * no puede incluir el resultado en el armazón estático.
 *
 * Las acciones del panel invalidan `ETIQUETAS.productos` al guardar.
 */
function cacheDeCatalogo() {
  cacheTag(ETIQUETAS.productos);
  cacheLife(VIDA_CATALOGO);
}

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

/*
 * Prisma devuelve los importes como `Decimal`, y esa clase no cruza dos
 * fronteras: la de `"use cache"` y la de un componente cliente. React solo
 * serializa objetos planos, así que un Decimal ahí provoca el error
 * "Only plain objects can be passed to Client Components".
 *
 * Se convierten a número dentro de la propia función cacheada, que es lo
 * único que ve la base: de la frontera para afuera el catálogo ya trabajaba
 * con `Number(...)` y `String(...)`, así que nada más cambia.
 */
const numero = (valor: Prisma.Decimal | null) => (valor == null ? null : Number(valor));

type ProductoTarjeta = Prisma.ProductoGetPayload<{ include: typeof incluirTarjeta }>;

function tarjetaPlana(producto: ProductoTarjeta) {
  return {
    ...producto,
    precio: Number(producto.precio),
    precioOferta: numero(producto.precioOferta),
    costo: numero(producto.costo),
    variantes: producto.variantes.map((variante) => ({
      ...variante,
      precio: numero(variante.precio),
    })),
  };
}

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

/**
 * Catálogo filtrado y paginado.
 *
 * Va cacheada aunque dependa de los filtros: los argumentos forman parte de
 * la clave, así que cada combinación guarda su propio resultado. La primera
 * persona que aplica "talla M + Negro" paga la consulta; el resto la recibe
 * de memoria. Es lo que permite que el catálogo responda rápido sin poder
 * pre-construirse.
 */
export async function listarProductos(
  filtros: Filtros & { porPagina?: number } = {},
) {
  "use cache";
  cacheDeCatalogo();

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
    productos: productos.map(tarjetaPlana),
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
  "use cache";
  cacheDeCatalogo();

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
export async function listarNuevosIngresos(limite = PRODUCTOS_PORTADA) {
  "use cache";
  cacheDeCatalogo();

  const productos = await db.producto.findMany({
    where: { activo: true },
    include: incluirTarjeta,
    orderBy: { creadoEn: "desc" },
    take: limite,
  });
  return productos.map(tarjetaPlana);
}

/**
 * Productos con precio rebajado vigente. La comparación entre columnas la
 * resuelve la base de datos, así el límite devuelve ofertas reales.
 */
export async function listarOfertas(limite = PRODUCTOS_PORTADA) {
  "use cache";
  cacheDeCatalogo();

  const productos = await db.producto.findMany({
    where: { activo: true, ...enOferta },
    include: incluirTarjeta,
    orderBy: { actualizadoEn: "desc" },
    take: limite,
  });
  return productos.map(tarjetaPlana);
}

/** Total de productos publicados, para los datos de la portada. */
export async function contarProductosActivos() {
  "use cache";
  cacheDeCatalogo();

  return db.producto.count({ where: { activo: true } });
}

/** Productos marcados como destacados por el administrador. */
export async function listarDestacados(limite = 4) {
  "use cache";
  cacheDeCatalogo();

  const productos = await db.producto.findMany({
    where: { activo: true, destacado: true },
    include: incluirTarjeta,
    orderBy: { actualizadoEn: "desc" },
    take: limite,
  });
  return productos.map(tarjetaPlana);
}

/**
 * Slugs de todo lo publicado, para pre-construir las fichas en el build.
 *
 * Va sin caché a propósito: corre una sola vez por build y ahí interesa la
 * foto exacta del catálogo, no una guardada de antes.
 */
export async function listarSlugsPublicados() {
  const productos = await db.producto.findMany({
    where: { activo: true },
    select: { slug: true },
  });
  return productos.map(({ slug }) => ({ slug }));
}

/** Ficha completa. Es la consulta más pesada y la página con más tráfico. */
export async function obtenerProductoPorSlug(slug: string) {
  "use cache";
  cacheDeCatalogo();

  const producto = await db.producto.findUnique({
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

  if (!producto) return null;

  // Mismos importes que en las tarjetas: fuera de Decimal antes de cruzar la
  // frontera del caché. Acá las variantes traen también su costo.
  return {
    ...producto,
    precio: Number(producto.precio),
    precioOferta: numero(producto.precioOferta),
    costo: numero(producto.costo),
    variantes: producto.variantes.map((variante) => ({
      ...variante,
      precio: numero(variante.precio),
      costo: numero(variante.costo),
    })),
  };
}
