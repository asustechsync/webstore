import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { ETIQUETAS_ADMIN, VIDA_DASHBOARD } from "./cache";

// Mismo criterio que en Reportes: solo estos estados cuentan como venta real.
const ESTADOS_VENTA = ["PAGADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO"] as const;
// Un pedido en estos estados todavía necesita que alguien lo mueva.
const ESTADOS_PENDIENTES = ["PENDIENTE", "PAGADO"] as const;

function haceDias(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

function variacion(actual: number, anterior: number) {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return Math.round(((actual - anterior) / anterior) * 100);
}

/**
 * Todo lo que pinta /admin, en una sola función cacheada.
 *
 * Antes esto eran 11 viajes a la base en cada carga del panel. Ahora la
 * primera persona que entra después de que la caché expira (o de que una
 * acción la invalidó) paga esa consulta; el resto la recibe de memoria.
 *
 * Las acciones de pedidos, stock, cupones y usuarios invalidan
 * `ETIQUETAS_ADMIN.dashboard` al guardar (ver cada archivo `actions.ts`).
 */
export async function obtenerDatosDashboard() {
  "use cache";
  cacheTag(ETIQUETAS_ADMIN.dashboard);
  cacheLife(VIDA_DASHBOARD);

  const ahora = Date.now();
  const hace7Dias = haceDias(7);
  const hace14Dias = haceDias(14);
  const en7Dias = new Date();
  en7Dias.setDate(en7Dias.getDate() + 7);

  const [
    pedidosPendientes,
    variantesActivas,
    cuponesPorVencer,
    pedidosSemana,
    pedidosSemanaAnterior,
    clientesNuevosSemana,
    clientesNuevosSemanaAnterior,
    clientesRecurrentes,
    ultimosPedidos,
    ultimosUsuarios,
    itemsSemana,
  ] = await Promise.all([
    db.pedido.findMany({
      where: { estado: { in: [...ESTADOS_PENDIENTES] } },
      orderBy: { creadoEn: "asc" }, // los más antiguos primero: son los más urgentes
      take: 5,
      include: { usuario: { select: { email: true } } },
    }),
    // Prisma no compara dos columnas en un where (cantidad vs. stockMinimo),
    // así que se filtra en memoria — igual que en /admin/productos.
    db.variante.findMany({
      where: { activo: true },
      orderBy: { cantidad: "asc" },
      include: { producto: { select: { nombre: true } } },
    }),
    db.cupon.findMany({
      where: { activo: true, fechaFin: { gte: new Date(), lte: en7Dias } },
      orderBy: { fechaFin: "asc" },
      take: 5,
    }),
    // Solo lo mínimo para calcular ventas/pedidos de hoy y de la semana, y
    // sus mini-ondas: el detalle por producto/cliente vive en /admin/reportes.
    db.pedido.findMany({
      where: { estado: { in: [...ESTADOS_VENTA] }, creadoEn: { gte: hace7Dias } },
      select: { total: true, creadoEn: true },
    }),
    db.pedido.aggregate({
      where: {
        estado: { in: [...ESTADOS_VENTA] },
        creadoEn: { gte: hace14Dias, lt: hace7Dias },
      },
      _sum: { total: true },
      _count: true,
    }),
    db.usuario.count({ where: { creadoEn: { gte: hace7Dias } } }),
    db.usuario.count({ where: { creadoEn: { gte: hace14Dias, lt: hace7Dias } } }),
    db.usuario.count({
      where: {
        AND: [
          { pedidos: { some: { estado: { in: [...ESTADOS_VENTA] }, creadoEn: { gte: hace7Dias } } } },
          { pedidos: { some: { estado: { in: [...ESTADOS_VENTA] }, creadoEn: { lt: hace7Dias } } } },
        ],
      },
    }),
    db.pedido.findMany({
      orderBy: { creadoEn: "desc" },
      take: 8,
      include: { usuario: { select: { email: true } } },
    }),
    db.usuario.findMany({ orderBy: { creadoEn: "desc" }, take: 5 }),
    // Top productos de la semana se calcula en memoria (igual que en
    // Reportes): el ingreso por línea es cantidad × precioUnit, algo que
    // Prisma no suma directo. Va en el mismo Promise.all: no depende de
    // ninguna de las consultas anteriores.
    db.itemPedido.findMany({
      where: {
        pedido: { estado: { in: [...ESTADOS_VENTA] }, creadoEn: { gte: hace7Dias } },
      },
      include: { variante: { include: { producto: { select: { id: true, nombre: true } } } } },
    }),
  ]);

  const variantesBajas = variantesActivas
    .filter((variante) => variante.cantidad <= variante.stockMinimo)
    .slice(0, 5);

  const porProducto = new Map<string, { nombre: string; unidades: number }>();
  for (const item of itemsSemana) {
    const producto = item.variante.producto;
    const actual = porProducto.get(producto.id) ?? { nombre: producto.nombre, unidades: 0 };
    actual.unidades += item.cantidad;
    porProducto.set(producto.id, actual);
  }
  const topProductosSemana = [...porProducto.values()]
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 5);

  const ventasSemana = pedidosSemana.reduce((suma, p) => suma + Number(p.total), 0);
  const ventasSemanaAnterior = Number(pedidosSemanaAnterior._sum.total ?? 0);
  const ticketPromedioSemana = pedidosSemana.length > 0 ? ventasSemana / pedidosSemana.length : 0;
  const ticketPromedioSemanaAnterior =
    pedidosSemanaAnterior._count > 0 ? ventasSemanaAnterior / pedidosSemanaAnterior._count : 0;

  return {
    pedidosPendientes: pedidosPendientes.map((pedido) => ({
      id: pedido.id,
      email: pedido.usuario.email,
      total: Number(pedido.total),
      estado: pedido.estado,
      dias: Math.floor((ahora - pedido.creadoEn.getTime()) / 86_400_000),
    })),
    variantesBajas: variantesBajas.map((variante) => ({
      id: variante.id,
      nombre: variante.producto.nombre,
      talla: variante.talla,
      color: variante.color,
      cantidad: variante.cantidad,
    })),
    cuponesPorVencer: cuponesPorVencer.map((cupon) => ({
      id: cupon.id,
      codigo: cupon.codigo,
      fechaFin: cupon.fechaFin,
    })),
    ventasSemana,
    cambioVsSemanaAnterior: variacion(ventasSemana, ventasSemanaAnterior),
    ticketPromedioSemana,
    cambioTicket: variacion(ticketPromedioSemana, ticketPromedioSemanaAnterior),
    pedidosSemanaLength: pedidosSemana.length,
    cambioPedidos: variacion(pedidosSemana.length, pedidosSemanaAnterior._count),
    clientesNuevosSemana,
    cambioClientesNuevos: variacion(clientesNuevosSemana, clientesNuevosSemanaAnterior),
    clientesRecurrentes,
    topProductosSemana,
    ultimosPedidos: ultimosPedidos.map((pedido) => ({
      id: pedido.id,
      email: pedido.usuario.email,
      total: Number(pedido.total),
      estado: pedido.estado,
    })),
    ultimosUsuarios: ultimosUsuarios.map((usuario) => ({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
    })),
  };
}

export type DatosDashboard = Awaited<ReturnType<typeof obtenerDatosDashboard>>;
