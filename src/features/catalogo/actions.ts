"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAlgunPermiso, requirePermiso } from "@/lib/auth";
import { ejecutar } from "@/lib/acciones";
import { eliminarImagen, subirImagen } from "@/integrations/cloudinary/client";
import {
  ajusteStockSchema,
  categoriaSchema,
  marcaSchema,
  productoSchema,
  type AjusteStockInput,
  type CategoriaInput,
  type MarcaInput,
  type ProductoInput,
} from "./schemas";

const MAXIMO_IMAGEN_BYTES = 5 * 1024 * 1024;

function revalidarCatalogo(slug?: string) {
  revalidatePath("/admin/productos");
  revalidatePath("/admin/stock");
  revalidatePath("/productos");
  if (slug) revalidatePath(`/productos/${slug}`);
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

export async function crearProducto(datos: ProductoInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.crear");
    const { variantes, imagenes, ...producto } = productoSchema.parse(datos);

    const creado = await db.producto.create({
      data: {
        ...producto,
        variantes: {
          create: variantes.map((variante) => ({
            talla: variante.talla,
            color: variante.color,
            sku: variante.sku,
            precio: variante.precio,
            cantidad: variante.cantidad,
            stockMinimo: variante.stockMinimo,
            activo: variante.activo,
          })),
        },
        imagenes: {
          create: imagenes.map((imagen, indice) => ({ ...imagen, orden: indice })),
        },
      },
    });

    revalidarCatalogo(creado.slug);
    return creado.id;
  });
}

export async function actualizarProducto(id: string, datos: ProductoInput) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");
    const { variantes, imagenes, ...producto } = productoSchema.parse(datos);

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

      for (const { id: varianteId, ...variante } of variantes) {
        if (varianteId) {
          await tx.variante.update({ where: { id: varianteId }, data: variante });
        } else {
          await tx.variante.create({ data: { ...variante, productoId: id } });
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
          precioOferta: producto.precioOferta ?? null,
          marcaId: producto.marcaId ?? null,
          material: producto.material ?? null,
          cuidados: producto.cuidados ?? null,
          guiaTallas: producto.guiaTallas ?? null,
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
      include: { variantes: true, imagenes: { orderBy: { orden: "asc" } } },
    });
    if (!original) throw new Error("El producto ya no existe");

    const sufijo = Date.now().toString().slice(-5);

    const copia = await db.producto.create({
      data: {
        nombre: `${original.nombre} (copia)`,
        slug: `${original.slug}-copia-${sufijo}`,
        descripcion: original.descripcion,
        precio: original.precio,
        precioOferta: original.precioOferta,
        sku: `${original.sku}-COPIA-${sufijo}`,
        categoriaId: original.categoriaId,
        marcaId: original.marcaId,
        material: original.material,
        cuidados: original.cuidados,
        guiaTallas: original.guiaTallas,
        activo: false,
        destacado: false,
        variantes: {
          create: original.variantes.map((variante) => ({
            talla: variante.talla,
            color: variante.color,
            sku: `${variante.sku}-COPIA-${sufijo}`,
            precio: variante.precio,
            // El stock no se copia: la copia arranca sin inventario.
            cantidad: 0,
            stockMinimo: variante.stockMinimo,
            activo: variante.activo,
          })),
        },
        imagenes: {
          create: original.imagenes.map((imagen) => ({
            url: imagen.url,
            publicId: imagen.publicId,
            orden: imagen.orden,
          })),
        },
      },
    });

    revalidarCatalogo();
    return copia.id;
  });
}

export async function alternarActivoProducto(id: string, activo: boolean) {
  return ejecutar(async () => {
    await requirePermiso("productos.editar");

    const producto = await db.producto.update({ where: { id }, data: { activo } });

    revalidarCatalogo(producto.slug);
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

export async function crearCategoria(datos: CategoriaInput) {
  return ejecutar(async () => {
    await requirePermiso("categorias.crear");
    const validado = categoriaSchema.parse(datos);

    await db.categoria.create({ data: validado });

    revalidatePath("/admin/categorias");
    revalidatePath("/categorias");
  });
}

export async function actualizarCategoria(id: string, datos: CategoriaInput) {
  return ejecutar(async () => {
    await requirePermiso("categorias.editar");
    const validado = categoriaSchema.parse(datos);

    if (validado.padreId === id) {
      throw new Error("Una categoría no puede ser su propia categoría padre");
    }

    await db.categoria.update({
      where: { id },
      // Prisma trata undefined como "no cambiar", así que los opcionales que
      // el formulario dejó vacíos se mandan explícitamente como null.
      data: {
        ...validado,
        descripcion: validado.descripcion ?? null,
        imagenUrl: validado.imagenUrl ?? null,
        padreId: validado.padreId ?? null,
      },
    });

    revalidatePath("/admin/categorias");
    revalidatePath("/categorias");
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
