"use server";

import { db } from "@/lib/db";
import { ejecutar } from "@/lib/acciones";
import { precioEfectivo, type InfoVariante } from "./revision";
import { varianteIdsSchema } from "./schemas";

/**
 * Estado actual de las variantes que hay en el carrito.
 *
 * Como el resto del catálogo, no pide sesión: devuelve lo mismo que ya
 * muestra la ficha del producto (nombre, precio y stock) y solo para los ids
 * que se consultan. Sirve para avisar antes de pagar; quien decide de verdad
 * el precio y el stock sigue siendo `crearPedido`, que lo recalcula contra la
 * base dentro de una transacción.
 */
export async function revisarVariantes(varianteIds: string[]) {
  return ejecutar(async (): Promise<InfoVariante[]> => {
    const ids = varianteIdsSchema.parse(varianteIds);

    const variantes = await db.variante.findMany({
      // Sin filtrar por activo: una variante despublicada tiene que volver
      // igual para poder avisar que ya no se puede comprar.
      where: { id: { in: ids } },
      select: {
        id: true,
        activo: true,
        cantidad: true,
        precio: true,
        producto: {
          select: { nombre: true, precio: true, precioOferta: true, activo: true },
        },
      },
    });

    return variantes.map((variante) => {
      const precioVariante = variante.precio != null ? Number(variante.precio) : null;
      const precioProducto = Number(variante.producto.precio);
      const oferta =
        variante.producto.precioOferta != null ? Number(variante.producto.precioOferta) : null;

      return {
        varianteId: variante.id,
        nombre: variante.producto.nombre,
        activa: variante.activo && variante.producto.activo,
        stock: variante.cantidad,
        precio: precioEfectivo(precioVariante, precioProducto, oferta),
        precioLista: precioVariante ?? precioProducto,
      };
    });
  });
}
