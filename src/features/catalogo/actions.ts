"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAlgunPermiso, requirePermiso } from "@/lib/auth";
import { ejecutar } from "@/lib/acciones";
import { eliminarImagen, subirImagen } from "@/integrations/cloudinary/client";
import { slugificar } from "@/lib/utils";
import {
  ajusteStockSchema,
  atributoCatalogoSchema,
  categoriaSchema,
  marcaSchema,
  productoSchema,
  productoBorradorSchema,
  valorAtributoCatalogoSchema,
  type AjusteStockInput,
  type AtributoCatalogoInput,
  type CategoriaInput,
  type MarcaInput,
  type ProductoInput,
  type ProductoBorradorInput,
  type ProductoValidado,
  type ValorAtributoCatalogoInput,
} from "./schemas";
import {
  claveAtributos,
  etiquetaAtributos,
  obtenerAtributo,
} from "./opciones";

const MAXIMO_IMAGEN_BYTES = 5 * 1024 * 1024;

function revalidarCatalogo(slug?: string) {
  revalidatePath("/admin/productos");
  revalidatePath("/admin/stock");
  revalidatePath("/productos");
  if (slug) revalidatePath(`/productos/${slug}`);
}

type OpcionValidada = ProductoValidado["opciones"][number];
type VarianteValidada = ProductoValidado["variantes"][number];

async function crearOpcionesProducto(
  tx: Prisma.TransactionClient,
  productoId: string,
  opciones: OpcionValidada[],
) {
  const idsPorValor = new Map<string, string>();

  for (const [ordenOpcion, opcion] of opciones.entries()) {
    const creada = await tx.opcionProducto.create({
      data: {
        productoId,
        clave: opcion.clave,
        nombre: opcion.nombre,
        orden: ordenOpcion,
        valores: {
          create: opcion.valores.map((valor, orden) => ({ valor, orden })),
        },
      },
      include: { valores: true },
    });

    for (const valor of creada.valores) {
      idsPorValor.set(`${creada.clave}\u0000${valor.valor}`, valor.id);
    }
  }

  return idsPorValor;
}

function datosEscalaresVariante(variante: VarianteValidada) {
  const sinColor = variante.atributos.filter((atributo) => atributo.clave !== "color");

  return {
    talla: etiquetaAtributos(sinColor),
    color: obtenerAtributo(variante.atributos, "color"),
    claveOpciones: claveAtributos(variante.atributos),
    sku: variante.sku,
    precio: variante.precio ?? null,
    costo: variante.costo ?? null,
    cantidad: variante.cantidad,
    stockMinimo: variante.stockMinimo,
    activo: variante.activo,
  };
}

function idsValoresVariante(
  variante: VarianteValidada,
  idsPorValor: Map<string, string>,
) {
  return variante.atributos.map((atributo) => {
    const id = idsPorValor.get(`${atributo.clave}\u0000${atributo.valor}`);
    if (!id) throw new Error(`La opción ${atributo.clave}=${atributo.valor} no existe`);
    return id;
  });
}

// ── Imágenes ──────────────────────────────────────────────

// Sube a Cloudinary y devuelve la referencia; la fila en `imagenes_producto`
// se crea recién al guardar el producto, así el formulario puede mostrar la
// foto antes de existir el producto (caso "nuevo producto").
export async function subirImagenProducto(formData: FormData) {
  return ejecutar(async () => {
    await requireAlgunPermiso("productos.crear", "productos.editar");

    const archivo = formData.get("archivo");
    if (!(archivo instanceof File) || archivo.size === 0) {
      throw new Error("No se recibió ninguna imagen");
    }
    if (!archivo.type.startsWith("image/")) {
      throw new Error("El archivo debe ser una imagen");
    }
    if (archivo.size > MAXIMO_IMAGEN_BYTES) {
      throw new Error("La imagen no debe pesar más de 5 MB");
    }

    return subirImagen(archivo, "productos");
  });
}

// ── Productos ─────────────────────────────────────────────

/**
 * Crea solamente el registro base para que el administrador pueda continuar
 * completando el producto y sus variantes en una segunda pantalla.
 * El SKU se reserva desde el primer clic y no vuelve a cambiar.
 */
export async function crearProductoBorrador(datos: ProductoBorradorInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.crear");
    const validado = productoBorradorSchema.parse(datos);
    const categoria = await db.categoria.findFirst({ where: { id: validado.categoriaId, activo: true }, select: { id: true } });
    if (!categoria) throw new Error("Selecciona una categoría activa");

    const creado = await db.$transaction(async (tx) => {
      // El contador se calcula dentro de la transacción y se confirma contra
      // la restricción UNIQUE para que el SKU quede reservado inmediatamente.
      let numero = (await tx.producto.count({ where: { sku: { startsWith: `${validado.codigoTipo}-` } } })) + 1;
      while (true) {
        const sku = `${validado.codigoTipo}-${String(numero).padStart(3, "0")}`;
        const existente = await tx.producto.findUnique({ where: { sku }, select: { id: true } });
        if (!existente) {
          return tx.producto.create({
            data: {
              nombre: validado.nombre,
              slug: slugificar(validado.nombre),
              descripcion: "",
              precio: 0,
              sku,
              borrador: true,
              modoVariantes: validado.modoVariantes,
              tipoProducto: validado.codigoTipo === "ME" ? "MEDIAS_MUJER" : validado.codigoTipo === "BO" ? "BOXER_ADULTO" : validado.codigoTipo === "PR" ? "ROPA_ADULTO" : validado.codigoTipo === "BR" ? "BRASIER" : "PERSONALIZADO",
              categoriaId: categoria.id,
              activo: false,
              destacado: false,
            },
            select: { id: true, sku: true },
          });
        }
        numero += 1;
      }
    });

    revalidarCatalogo();
    return creado;
  });
}

export async function crearProducto(datos: ProductoInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.crear");
    const { variantes, imagenes, opciones, ...producto } = productoSchema.parse(datos);

    const creado = await db.$transaction(async (tx) => {
      const nuevo = await tx.producto.create({
        data: {
          ...producto,
          descripcionCorta: producto.descripcionCorta ?? null,
          borrador: false,
          skuInterno: producto.skuInterno ?? null,
          codigoBarras: producto.codigoBarras ?? null,
          proveedor: producto.proveedor ?? null,
          precioOferta: producto.precioOferta ?? null,
          costo: producto.costo ?? null,
          marcaId: producto.marcaId ?? null,
          tipoProducto: producto.tipoProducto ?? null,
          perfilOpciones: producto.perfilOpciones ?? null,
          material: producto.material ?? null,
          cuidados: producto.cuidados ?? null,
          guiaTallas: producto.guiaTallas ?? null,
          pesoKg: producto.pesoKg ?? null,
          anchoCm: producto.anchoCm ?? null,
          altoCm: producto.altoCm ?? null,
          largoCm: producto.largoCm ?? null,
          tituloSeo: producto.tituloSeo ?? null,
          descripcionSeo: producto.descripcionSeo ?? null,
          imagenes: {
            create: imagenes.map((imagen, indice) => ({ ...imagen, orden: indice })),
          },
        },
      });

      const idsPorValor = await crearOpcionesProducto(tx, nuevo.id, opciones);

      for (const variante of variantes) {
        const idsValores = idsValoresVariante(variante, idsPorValor);
        await tx.variante.create({
          data: {
            productoId: nuevo.id,
            ...datosEscalaresVariante(variante),
            valores: { create: idsValores.map((valorId) => ({ valorId })) },
          },
        });
      }

      return nuevo;
    });

    revalidarCatalogo(creado.slug);
    return creado.id;
  });
}

export async function actualizarProducto(id: string, datos: ProductoInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const { variantes, imagenes, opciones, ...producto } = productoSchema.parse(datos);

    const actual = await db.producto.findUnique({
      where: { id },
      include: { imagenes: true },
    });
    if (!actual) throw new Error("El producto ya no existe");

    const idsConservados = variantes
      .map((variante) => variante.id)
      .filter((varianteId): varianteId is string => Boolean(varianteId));

    // Una variante ya vendida no se puede borrar (items_pedido es RESTRICT);
    // avisamos antes para que la desactiven en vez de eliminarla.
    const vendidas = await db.itemPedido.count({
      where: { variante: { productoId: id, id: { notIn: idsConservados } } },
    });
    if (vendidas > 0) {
      throw new Error(
        "No puedes quitar una talla que ya tiene pedidos; desactívala en lugar de eliminarla",
      );
    }

    const publicIdsConservados = imagenes.map((imagen) => imagen.publicId);
    const imagenesAEliminar = actual.imagenes.filter(
      (imagen) => !publicIdsConservados.includes(imagen.publicId),
    );

    await db.$transaction(async (tx) => {
      await tx.variante.deleteMany({
        where: { productoId: id, id: { notIn: idsConservados } },
      });

      // Libera temporalmente las claves únicas por si el usuario intercambia
      // opciones entre dos variantes existentes.
      for (const varianteId of idsConservados) {
        await tx.variante.update({
          where: { id: varianteId },
          data: { claveOpciones: `__temporal__=${varianteId}` },
        });
      }

      // Las opciones se reconstruyen porque solo pertenecen a este producto;
      // las variantes conservan su id, pedidos, carrito y movimientos de stock.
      await tx.opcionProducto.deleteMany({ where: { productoId: id } });
      const idsPorValor = await crearOpcionesProducto(tx, id, opciones);

      for (const variante of variantes) {
        const { id: varianteId } = variante;
        const escalares = datosEscalaresVariante(variante);
        const idsValores = idsValoresVariante(variante, idsPorValor);

        if (varianteId) {
          await tx.variante.update({ where: { id: varianteId }, data: escalares });
          await tx.valorVariante.createMany({
            data: idsValores.map((valorId) => ({ varianteId, valorId })),
          });
        } else {
          await tx.variante.create({
            data: {
              productoId: id,
              ...escalares,
              valores: { create: idsValores.map((valorId) => ({ valorId })) },
            },
          });
        }
      }

      // Las imágenes se reescriben completas para que `orden` refleje
      // exactamente el orden en que quedaron en el formulario.
      await tx.imagenProducto.deleteMany({ where: { productoId: id } });
      await tx.imagenProducto.createMany({
        data: imagenes.map((imagen, indice) => ({
          ...imagen,
          productoId: id,
          orden: indice,
        })),
      });

      await tx.producto.update({
        where: { id },
        // Prisma trata undefined como "no cambiar", así que los opcionales que
        // el formulario dejó vacíos se mandan explícitamente como null.
        data: {
          ...producto,
          descripcionCorta: producto.descripcionCorta ?? null,
          skuInterno: producto.skuInterno ?? null,
          codigoBarras: producto.codigoBarras ?? null,
          proveedor: producto.proveedor ?? null,
          precioOferta: producto.precioOferta ?? null,
          costo: producto.costo ?? null,
          marcaId: producto.marcaId ?? null,
          tipoProducto: producto.tipoProducto ?? null,
          perfilOpciones: producto.perfilOpciones ?? null,
          material: producto.material ?? null,
          cuidados: producto.cuidados ?? null,
          guiaTallas: producto.guiaTallas ?? null,
          pesoKg: producto.pesoKg ?? null,
          anchoCm: producto.anchoCm ?? null,
          altoCm: producto.altoCm ?? null,
          largoCm: producto.largoCm ?? null,
          tituloSeo: producto.tituloSeo ?? null,
          descripcionSeo: producto.descripcionSeo ?? null,
          borrador: false,
        },
      });
    });

    // Recién cuando la base confirmó, se borran los archivos de Cloudinary.
    await Promise.allSettled(
      imagenesAEliminar.map((imagen) => eliminarImagen(imagen.publicId)),
    );

    revalidarCatalogo(producto.slug);
    if (actual.slug !== producto.slug) revalidatePath(`/productos/${actual.slug}`);
    return id;
  });
}

export async function eliminarProducto(id: string) {
  return ejecutar(async () => {
    await requirePermiso("productos.eliminar");

    const producto = await db.producto.findUnique({
      where: { id },
      include: { imagenes: true },
    });
    if (!producto) throw new Error("El producto ya no existe");

    const vendido = await db.itemPedido.count({ where: { variante: { productoId: id } } });
    if (vendido > 0) {
      throw new Error(
        "No se puede eliminar: el producto ya tiene pedidos. Desactívalo para ocultarlo de la tienda.",
      );
    }

    await db.producto.delete({ where: { id } });

    await Promise.allSettled(
      producto.imagenes.map((imagen) => eliminarImagen(imagen.publicId)),
    );

    revalidarCatalogo(producto.slug);
  });
}

// Duplicar ahorra rellenar todo de nuevo cuando es el mismo modelo en otro
// color. Nace desactivado y con los SKU/slug marcados para que no choquen.
export async function duplicarProducto(id: string) {
  return ejecutar(async () => {
    await requirePermiso("productos.crear");

    const original = await db.producto.findUnique({
      where: { id },
      include: {
        opciones: { orderBy: { orden: "asc" }, include: { valores: { orderBy: { orden: "asc" } } } },
        variantes: { include: { valores: { include: { valor: { include: { opcion: true } } } } } },
        imagenes: { orderBy: { orden: "asc" } },
      },
    });
    if (!original) throw new Error("El producto ya no existe");

    const sufijo = Date.now().toString().slice(-5);

    const copia = await db.$transaction(async (tx) => {
      const productoCopia = await tx.producto.create({ data: {
        nombre: `${original.nombre} (copia)`,
        slug: `${original.slug}-copia-${sufijo}`,
        descripcion: original.descripcion,
        descripcionCorta: original.descripcionCorta,
        proveedor: original.proveedor,
        precio: original.precio,
        precioOferta: original.precioOferta,
        costo: original.costo,
        sku: `${original.sku}-COPIA-${sufijo}`,
        tipoProducto: original.tipoProducto,
        perfilOpciones: original.perfilOpciones,
        categoriaId: original.categoriaId,
        marcaId: original.marcaId,
        material: original.material,
        cuidados: original.cuidados,
        guiaTallas: original.guiaTallas,
        activo: false,
        destacado: false,
        imagenes: {
          create: original.imagenes.map((imagen) => ({
            url: imagen.url,
            publicId: imagen.publicId,
            orden: imagen.orden,
          })),
        },
      } });

      const opciones = original.opciones.map((opcion) => ({
        clave: opcion.clave,
        nombre: opcion.nombre,
        valores: opcion.valores.map((valor) => valor.valor),
      }));
      const idsPorValor = await crearOpcionesProducto(tx, productoCopia.id, opciones);

      for (const variante of original.variantes) {
        const atributos = variante.valores.map(({ valor }) => ({
          clave: valor.opcion.clave,
          valor: valor.valor,
        }));
        const idsValores = atributos.map((atributo) => {
          const valorId = idsPorValor.get(`${atributo.clave}\u0000${atributo.valor}`);
          if (!valorId) throw new Error("No se pudo copiar una opción del producto");
          return valorId;
        });

        await tx.variante.create({
          data: {
            productoId: productoCopia.id,
            talla: variante.talla,
            color: variante.color,
            claveOpciones: claveAtributos(atributos),
            sku: `${variante.sku}-COPIA-${sufijo}`,
            precio: variante.precio,
            costo: variante.costo,
            cantidad: 0,
            stockMinimo: variante.stockMinimo,
            activo: variante.activo,
            valores: { create: idsValores.map((valorId) => ({ valorId })) },
          },
        });
      }

      return productoCopia;
    });

    revalidarCatalogo();
    return copia.id;
  });
}

export async function alternarActivoProducto(id: string, activo: boolean) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");

    if (activo) {
      const productoActual = await db.producto.findUnique({
        where: { id },
        select: { borrador: true },
      });
      if (productoActual?.borrador) {
        throw new Error("Completa y guarda el borrador antes de publicarlo en la tienda");
      }
    }

    const producto = await db.producto.update({
      where: { id },
      data: { activo },
      select: { slug: true },
    });

    revalidarCatalogo(producto.slug);
  });
}

export async function alternarActivoVariante(id: string, activo: boolean) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");

    const variante = await db.variante.update({
      where: { id },
      data: { activo },
      select: { producto: { select: { slug: true } } },
    });

    revalidarCatalogo(variante.producto.slug);
  });
}

// ── Stock por variante ────────────────────────────────────

export async function ajustarStock(varianteId: string, datos: AjusteStockInput) {
  return ejecutar(async () => {
    await requirePermiso("stock.editar");
    const validado = ajusteStockSchema.parse(datos);

    await db.variante.update({ where: { id: varianteId }, data: validado });

    revalidatePath("/admin/stock");
    revalidatePath("/admin");
  });
}

// ── Categorías ────────────────────────────────────────────

// ── Atributos reutilizables ────────────────────────────────

export async function crearAtributoCatalogo(datos: AtributoCatalogoInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const validado = atributoCatalogoSchema.parse(datos);

    await db.atributoCatalogo.create({
      data: {
        nombre: validado.nombre,
        clave: validado.clave,
        tipo: validado.tipo,
        activo: validado.activo,
        valores: { create: validado.valores.map((valor, orden) => ({ valor, orden })) },
      },
    });
    revalidatePath("/admin/atributos");
    revalidatePath("/admin/productos");
  });
}

export async function actualizarAtributoCatalogo(id: string, datos: AtributoCatalogoInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const validado = atributoCatalogoSchema.parse(datos);

    await db.atributoCatalogo.update({
      where: { id },
      data: {
        nombre: validado.nombre,
        clave: validado.clave,
        tipo: validado.tipo,
        activo: validado.activo,
      },
    });
    revalidatePath("/admin/atributos");
    revalidatePath("/admin/productos");
  });
}

export async function eliminarAtributoCatalogo(id: string) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    await db.atributoCatalogo.delete({ where: { id } });
    revalidatePath("/admin/atributos");
    revalidatePath("/admin/productos");
  });
}

export async function crearValorAtributoCatalogo(atributoId: string, datos: ValorAtributoCatalogoInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const validado = valorAtributoCatalogoSchema.parse(datos);
    const ultimo = await db.valorAtributoCatalogo.aggregate({ where: { atributoId }, _max: { orden: true } });
    await db.valorAtributoCatalogo.create({ data: { atributoId, valor: validado.valor, colorHex: validado.colorHex ?? null, orden: (ultimo._max.orden ?? -1) + 1 } });
    revalidatePath(`/admin/atributos/${atributoId}`);
    revalidatePath("/admin/atributos");
    revalidatePath("/admin/productos");
  });
}

export async function actualizarValorAtributoCatalogo(atributoId: string, id: string, datos: ValorAtributoCatalogoInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const validado = valorAtributoCatalogoSchema.parse(datos);
    const actualizado = await db.valorAtributoCatalogo.updateMany({ where: { id, atributoId }, data: { valor: validado.valor, colorHex: validado.colorHex ?? null } });
    if (!actualizado.count) throw new Error("No se encontró el valor del atributo");
    revalidatePath(`/admin/atributos/${atributoId}`);
    revalidatePath("/admin/atributos");
    revalidatePath("/admin/productos");
  });
}

export async function eliminarValorAtributoCatalogo(atributoId: string, id: string) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const eliminado = await db.valorAtributoCatalogo.deleteMany({ where: { id, atributoId } });
    if (!eliminado.count) throw new Error("No se encontró el valor del atributo");
    revalidatePath(`/admin/atributos/${atributoId}`);
    revalidatePath("/admin/atributos");
    revalidatePath("/admin/productos");
  });
}

export async function reordenarValoresAtributoCatalogo(atributoId: string, idsOrdenados: string[]) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    await db.$transaction(async (tx) => {
      const valores = await tx.valorAtributoCatalogo.findMany({ where: { atributoId }, select: { id: true } });
      const idsExistentes = new Set(valores.map(({ id }) => id));
      if (idsOrdenados.length !== valores.length || new Set(idsOrdenados).size !== valores.length || idsOrdenados.some((id) => !idsExistentes.has(id))) {
        throw new Error("El orden de valores no es válido");
      }
      await Promise.all(idsOrdenados.map((id, orden) => tx.valorAtributoCatalogo.update({ where: { id }, data: { orden } })));
    });
    revalidatePath(`/admin/atributos/${atributoId}`);
    revalidatePath("/admin/atributos");
    revalidatePath("/admin/productos");
  });
}

export async function crearCategoria(datos: CategoriaInput) {
  return ejecutar(async () => {
    await requirePermiso("categorias.crear");
    const validado = categoriaSchema.parse(datos);

    await db.categoria.create({
      // Una categoría oculta no debe ocupar una posición destacada en la portada.
      data: { ...validado, destacada: validado.activo && validado.destacada },
    });

    revalidatePath("/admin/categorias");
    revalidatePath("/categorias");
    revalidatePath("/");
  });
}

export async function actualizarCategoria(id: string, datos: CategoriaInput) {
  return ejecutar(async () => {
    await requirePermiso("categorias.editar");
    const validado = categoriaSchema.parse(datos);

    // Recorremos los ancestros elegidos para impedir ciclos A → B → A.
    // Sin esto, una categoría podría terminar siendo descendiente de sí misma.
    let padreId = validado.padreId;
    while (padreId) {
      if (padreId === id) {
        throw new Error("No puedes elegir una subcategoría como categoría padre");
      }
      const padre = await db.categoria.findUnique({
        where: { id: padreId },
        select: { padreId: true },
      });
      padreId = padre?.padreId ?? undefined;
    }

    await db.categoria.update({
      where: { id },
      // Prisma trata undefined como "no cambiar", así que los opcionales que
      // el formulario dejó vacíos se mandan explícitamente como null.
      data: {
        ...validado,
        descripcion: validado.descripcion ?? null,
        imagenUrl: validado.imagenUrl ?? null,
        tituloSeo: validado.tituloSeo ?? null,
        descripcionSeo: validado.descripcionSeo ?? null,
        padreId: validado.padreId ?? null,
        destacada: validado.activo && validado.destacada,
      },
    });

    revalidatePath("/admin/categorias");
    revalidatePath("/categorias");
    revalidatePath("/");
  });
}

export async function eliminarCategoria(id: string) {
  return ejecutar(async () => {
    await requirePermiso("categorias.eliminar");

    // La relación con productos es RESTRICT: avisamos antes de que la base
    // devuelva un error genérico de llave foránea.
    const productos = await db.producto.count({ where: { categoriaId: id } });
    if (productos > 0) {
      throw new Error(
        `No se puede eliminar: la categoría tiene ${productos} producto(s) asociado(s)`,
      );
    }

    const subcategorias = await db.categoria.count({ where: { padreId: id } });
    if (subcategorias > 0) {
      throw new Error(
        `No se puede eliminar: la categoría tiene ${subcategorias} subcategoría(s). Reasígnalas primero`,
      );
    }

    await db.categoria.delete({ where: { id } });

    revalidatePath("/admin/categorias");
    revalidatePath("/categorias");
  });
}

// ── Marcas ────────────────────────────────────────────────

export async function crearMarca(datos: MarcaInput) {
  return ejecutar(async () => {
    await requirePermiso("marcas.crear");
    const validado = marcaSchema.parse(datos);

    await db.marca.create({ data: validado });

    revalidatePath("/admin/marcas");
  });
}

export async function actualizarMarca(id: string, datos: MarcaInput) {
  return ejecutar(async () => {
    await requirePermiso("marcas.editar");
    const validado = marcaSchema.parse(datos);

    await db.marca.update({
      where: { id },
      // Prisma trata undefined como "no cambiar": el logo vacío debe borrarse.
      data: { ...validado, logoUrl: validado.logoUrl ?? null },
    });

    revalidatePath("/admin/marcas");
  });
}

export async function eliminarMarca(id: string) {
  return ejecutar(async () => {
    await requirePermiso("marcas.eliminar");

    // productos.marcaId es SET NULL, así que borrar la marca no rompe nada:
    // los productos simplemente quedan sin marca.
    await db.marca.delete({ where: { id } });

    revalidatePath("/admin/marcas");
    revalidatePath("/admin/productos");
  });
}
