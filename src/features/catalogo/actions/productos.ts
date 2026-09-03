"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAlgunPermiso, requirePermiso } from "@/lib/auth";
import { ejecutar } from "@/lib/acciones";
import { eliminarImagen, subirImagen } from "@/integrations/cloudinary/client";
import { slugificar } from "@/lib/utils";
import {
  productoSchema,
  productoBorradorSchema,
  type ProductoInput,
  type ProductoBorradorInput,
  type ProductoValidado,
} from "../schemas/productos";
import {
  claveAtributos,
  definicionCodigoTipo,
  etiquetaAtributos,
  obtenerAtributo,
} from "../opciones";

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
    // Sin atributos (producto único) la talla queda vacía a propósito: así la
    // ficha pública no dibuja un selector con un solo valor y el filtro de
    // tallas del catálogo no se llena de "Única".
    talla: sinColor.length > 0 ? etiquetaAtributos(sinColor) : "",
    color: obtenerAtributo(variante.atributos, "color"),
    claveOpciones: claveAtributos(variante.atributos),
    sku: variante.sku,
    precio: variante.precio ?? null,
    costo: variante.costo ?? null,
    cantidad: variante.cantidad,
    stockMinimo: variante.stockMinimo,
    activo: variante.activo,
    imagenUrl: variante.imagenUrl ?? null,
    imagenPublicId: variante.imagenPublicId ?? null,
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
 * Siguiente correlativo libre para un código de tipo.
 *
 * Solo cuentan los SKU con la forma exacta `ME-001`: los de las copias
 * (`ME-001-COPIA-12345`) también empiezan por `ME-` y antes inflaban el
 * contador, dejando huecos en la numeración.
 */
async function siguienteNumeroSku(codigoTipo: string) {
  const existentes = await db.producto.findMany({
    where: { sku: { startsWith: `${codigoTipo}-` } },
    select: { sku: true },
  });
  const patron = new RegExp(`^${codigoTipo}-(\\d+)$`);
  const mayor = existentes.reduce((maximo, { sku }) => {
    const numero = Number(patron.exec(sku)?.[1]);
    return Number.isFinite(numero) && numero > maximo ? numero : maximo;
  }, 0);
  return mayor + 1;
}

/** El slug es UNIQUE: dos productos con el mismo nombre reventaban al crearse. */
async function slugDisponible(nombre: string) {
  const base = slugificar(nombre) || "producto";
  const tomados = new Set(
    (await db.producto.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } }))
      .map((producto) => producto.slug),
  );
  if (!tomados.has(base)) return base;
  let sufijo = 2;
  while (tomados.has(`${base}-${sufijo}`)) sufijo += 1;
  return `${base}-${sufijo}`;
}

/**
 * Crea solamente el registro base para que el administrador pueda continuar
 * completando el producto en una segunda pantalla.
 *
 * El SKU se reserva desde el primer clic y no vuelve a cambiar. Un producto
 * único nace además con su presentación creada: es la fila que lleva el stock
 * y a la que apuntan el carrito y los pedidos, así que sin ella el producto no
 * se podría vender.
 */
export async function crearProductoBorrador(datos: ProductoBorradorInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.crear");
    const validado = productoBorradorSchema.parse(datos);
    const categoria = await db.categoria.findFirst({ where: { id: validado.categoriaId, activo: true }, select: { id: true } });
    if (!categoria) throw new Error("Selecciona una categoría activa");

    const tipo = definicionCodigoTipo(validado.codigoTipo);
    let slug = await slugDisponible(validado.nombre);
    let numero = await siguienteNumeroSku(validado.codigoTipo);

    // Entre el cálculo y el insert otro administrador pudo tomar el mismo
    // número o slug; la restricción UNIQUE es la que decide y acá se reintenta.
    for (let intento = 0; intento < 5; intento += 1) {
      const sku = `${validado.codigoTipo}-${String(numero).padStart(3, "0")}`;
      try {
        const creado = await db.producto.create({
          data: {
            nombre: validado.nombre,
            slug,
            descripcion: "",
            precio: 0,
            sku,
            borrador: true,
            modoVariantes: validado.modoVariantes,
            tipoProducto: tipo.tipoProducto,
            perfilOpciones: tipo.perfil,
            categoriaId: categoria.id,
            activo: false,
            destacado: false,
            ...(validado.modoVariantes
              ? {}
              : { variantes: { create: [{ talla: "", color: "", claveOpciones: "", sku }] } }),
          },
          select: { id: true, sku: true },
        });

        revalidarCatalogo();
        return creado;
      } catch (error) {
        const conflicto = error as { code?: string; meta?: { target?: string[] } };
        if (conflicto.code !== "P2002") throw error;
        if (conflicto.meta?.target?.includes("slug")) slug = await slugDisponible(`${slug}-2`);
        else numero += 1;
      }
    }

    throw new Error("No se pudo reservar un código para el producto; vuelve a intentarlo");
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
      include: {
        imagenes: true,
        variantes: { select: { id: true, imagenPublicId: true } },
      },
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

    // Portadas de variante que dejaron de usarse: la variante se borró, se
    // le quitó la foto o se reemplazó por otra. Se juntan acá para borrarlas
    // de Cloudinary recién cuando la base haya confirmado los cambios.
    const portadasEnUso = new Set(
      variantes
        .map((variante) => variante.imagenPublicId)
        .filter((publicId): publicId is string => Boolean(publicId)),
    );
    const portadasAEliminar = actual.variantes
      .map((variante) => variante.imagenPublicId)
      .filter((publicId): publicId is string => Boolean(publicId) && !portadasEnUso.has(publicId!));

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
    await Promise.allSettled([
      ...imagenesAEliminar.map((imagen) => eliminarImagen(imagen.publicId)),
      ...portadasAEliminar.map((publicId) => eliminarImagen(publicId)),
    ]);

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
      include: {
        imagenes: true,
        variantes: { select: { imagenPublicId: true } },
      },
    });
    if (!producto) throw new Error("El producto ya no existe");

    const vendido = await db.itemPedido.count({ where: { variante: { productoId: id } } });
    if (vendido > 0) {
      throw new Error(
        "No se puede eliminar: el producto ya tiene pedidos. Desactívalo para ocultarlo de la tienda.",
      );
    }

    await db.producto.delete({ where: { id } });

    await Promise.allSettled([
      ...producto.imagenes.map((imagen) => eliminarImagen(imagen.publicId)),
      ...producto.variantes
        .map((variante) => variante.imagenPublicId)
        .filter((publicId): publicId is string => Boolean(publicId))
        .map((publicId) => eliminarImagen(publicId)),
    ]);

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
        modoVariantes: original.modoVariantes,
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
            // La portada de variante no se copia a propósito: duplicar sirve
            // para el mismo modelo en otro color, así que esas fotos son
            // justo lo que hay que reemplazar. Copiar el publicId además
            // dejaría dos productos apuntando al mismo archivo de Cloudinary.
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

