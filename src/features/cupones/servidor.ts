import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import { faltaParaMinimo, type CuponAplicado } from "./calculo";
import { codigoCuponSchema } from "./schemas";

type ClientePrisma = typeof db | Prisma.TransactionClient;

/**
 * Comprueba que un cupón exista y se pueda usar ahora mismo. Lanza un error
 * con el motivo si no procede.
 *
 * Vive fuera de "use server" para que la usen tanto la validación del carrito
 * como la creación del pedido: quien cobra tiene que volver a verificar lo
 * mismo que se verificó al aplicarlo.
 */
export async function buscarCuponVigente(
  codigo: string,
  subtotal: number,
  cliente: ClientePrisma = db,
): Promise<{ id: string; aplicado: CuponAplicado }> {
  const codigoNormalizado = codigoCuponSchema.parse(codigo);
  const cupon = await cliente.cupon.findUnique({ where: { codigo: codigoNormalizado } });

  if (!cupon || !cupon.activo) {
    throw new Error("Ese cupón no existe o ya no está disponible");
  }

  const ahora = new Date();
  if (cupon.fechaInicio && cupon.fechaInicio > ahora) {
    throw new Error("Este cupón todavía no está vigente");
  }
  if (cupon.fechaFin && cupon.fechaFin < ahora) {
    throw new Error("Este cupón ya venció");
  }
  if (cupon.usoMaximo != null && cupon.usosActuales >= cupon.usoMaximo) {
    throw new Error("Este cupón llegó a su límite de usos");
  }

  const aplicado: CuponAplicado = {
    codigo: cupon.codigo,
    tipo: cupon.tipo,
    valor: Number(cupon.valor),
    montoMinimo: cupon.montoMinimo != null ? Number(cupon.montoMinimo) : null,
  };

  if (faltaParaMinimo(aplicado, subtotal) > 0) {
    throw new Error(`Este cupón aplica desde ${formatearPrecio(aplicado.montoMinimo as number)}`);
  }

  return { id: cupon.id, aplicado };
}
