"use server";

import { revalidatePath } from "next/cache";
import { EstadoPedido, MetodoPago } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePermiso, requireUsuarioActual } from "@/lib/auth";
import { ejecutar } from "@/lib/acciones";
import { precioEfectivo } from "@/features/carrito/revision";
import { calcularDescuentoCupon } from "@/features/cupones/calculo";
import { buscarCuponVigente } from "@/features/cupones/servidor";
import { crearPedidoSchema, type CrearPedidoInput } from "./schemas";

export async function cambiarEstadoPedido(id: string, estado: EstadoPedido) {
  return ejecutar(async () => {
    await requirePermiso("pedidos.gestionar");

    if (!Object.values(EstadoPedido).includes(estado)) {
      throw new Error("Estado de pedido inválido");
    }

    await db.pedido.update({ where: { id }, data: { estado } });

    revalidatePath("/admin/pedidos");
  });
}

/**
 * Precio que realmente se cobra, traducido desde los decimales de Prisma. La
 * regla es la misma que revisa el carrito, para que el importe que se muestra
 * antes de pagar y el que se cobra salgan de la misma cuenta.
 */
function precioDeVariante(variante: {
  precio: unknown;
  producto: { precio: unknown; precioOferta: unknown };
}) {
  return precioEfectivo(
    variante.precio != null ? Number(variante.precio) : null,
    Number(variante.producto.precio),
    variante.producto.precioOferta != null ? Number(variante.producto.precioOferta) : null,
  );
}

/**
 * Cierra la compra: crea el pedido, descuenta el stock y registra el uso del
 * cupón, todo en una transacción.
 *
 * Del cliente solo se aceptan qué variantes y cuántas unidades; los precios,
 * el descuento y el total se recalculan contra la base para que nadie pueda
 * comprar a un precio que no existe. El pedido nace PENDIENTE: el cobro se
 * confirma después (Izipay para tarjeta, verificación manual para el resto).
 */
export async function crearPedido(datos: CrearPedidoInput) {
  return ejecutar(async () => {
    const usuario = await requireUsuarioActual();
    const validado = crearPedidoSchema.parse(datos);

    const variantes = await db.variante.findMany({
      where: { id: { in: validado.items.map((item) => item.varianteId) }, activo: true },
      include: {
        producto: { select: { nombre: true, precio: true, precioOferta: true, costo: true, activo: true } },
      },
    });

    const porId = new Map(variantes.map((variante) => [variante.id, variante]));

    const lineas = validado.items.map((item) => {
      const variante = porId.get(item.varianteId);
      if (!variante || !variante.producto.activo) {
        throw new Error("Uno de los productos ya no está disponible. Revisa tu carrito.");
      }
      if (variante.cantidad < item.cantidad) {
        throw new Error(
          `Solo quedan ${variante.cantidad} de ${variante.producto.nombre} (${variante.sku}).`,
        );
      }
      return {
        varianteId: variante.id,
        cantidad: item.cantidad,
        precioUnit: precioDeVariante(variante),
        costoUnit: variante.costo != null ? Number(variante.costo) : variante.producto.costo != null ? Number(variante.producto.costo) : null,
      };
    });

    const subtotal = lineas.reduce((suma, linea) => suma + linea.precioUnit * linea.cantidad, 0);
    // El envío se coordina con Shalom después de confirmar el pago.
    const costoEnvio = 0;

    const pedidoId = await db.$transaction(async (tx) => {
      let cuponId: string | null = null;
      let descuento = 0;

      if (validado.codigoCupon) {
        const { id, aplicado } = await buscarCuponVigente(validado.codigoCupon, subtotal, tx);
        cuponId = id;
        descuento = calcularDescuentoCupon(aplicado, subtotal);
      }

      const total = Math.max(subtotal - descuento, 0) + costoEnvio;

      const pedido = await tx.pedido.create({
        data: {
          usuarioId: usuario.id,
          subtotal,
          costoEnvio,
          descuento,
          total,
          cuponId,
          metodoPago: validado.metodoPago as MetodoPago,
          envioDestinatario: validado.envio.destinatario,
          envioTelefono: validado.envio.telefono,
          envioDepartamento: validado.envio.departamento,
          envioProvincia: validado.envio.provincia,
          envioDistrito: validado.envio.distrito,
          envioDireccion: validado.envio.direccion,
          envioReferencia: validado.envio.referencia || null,
          envioCodigoPostal: validado.envio.codigoPostal || null,
          items: { create: lineas },
        },
        select: { id: true },
      });

      // Descuenta con la condición en el propio UPDATE: si otra compra se
      // llevó el stock entremedio, no se resta de más y la transacción cae.
      for (const linea of lineas) {
        const actualizadas = await tx.variante.updateMany({
          where: { id: linea.varianteId, cantidad: { gte: linea.cantidad } },
          data: { cantidad: { decrement: linea.cantidad } },
        });
        if (actualizadas.count === 0) {
          throw new Error("Se agotó el stock de un producto mientras confirmábamos tu pedido.");
        }
      }

      if (cuponId) {
        await tx.cupon.update({
          where: { id: cuponId },
          data: { usosActuales: { increment: 1 } },
        });
      }

      return pedido.id;
    });

    revalidatePath("/cuenta/pedidos");
    revalidatePath("/admin/pedidos");

    return { id: pedidoId };
  });
}
