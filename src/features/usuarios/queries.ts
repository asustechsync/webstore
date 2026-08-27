import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

// Datos compartidos por el layout y las vistas de cuenta. React cache() evita
// que ambos componentes ejecuten la misma consulta durante un mismo render.
export const obtenerResumenCuenta = cache(async (usuarioId: string) => {
  return db.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      apellidoPaterno: true,
      apellidoMaterno: true,
      telefono: true,
      fechaNacimiento: true,
      genero: true,
      tipoDocumento: true,
      documento: true,
      _count: { select: { pedidos: true, direcciones: true } },
      direcciones: {
        orderBy: [{ predeterminada: "desc" }, { creadoEn: "desc" }],
        take: 1,
        select: { provincia: true },
      },
    },
  });
});

export async function obtenerPedidosRecientes(usuarioId: string) {
  return db.pedido.findMany({
    where: { usuarioId },
    orderBy: { creadoEn: "desc" },
    take: 3,
    select: { id: true, estado: true, creadoEn: true },
  });
}

export function calcularPorcentajePerfil(perfil: {
  nombre: string;
  email: string;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  telefono: string | null;
  fechaNacimiento: Date | null;
  genero: string | null;
  tipoDocumento: string | null;
  documento: string | null;
}) {
  const campos = [
    perfil.nombre,
    perfil.email,
    perfil.apellidoPaterno,
    perfil.apellidoMaterno,
    perfil.telefono,
    perfil.fechaNacimiento,
    perfil.genero,
    perfil.tipoDocumento,
    perfil.documento,
  ];

  return Math.round((campos.filter(Boolean).length / campos.length) * 100);
}
