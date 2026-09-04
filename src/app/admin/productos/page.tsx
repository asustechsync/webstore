import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import { PageHeader } from "@/components/ui";
import { ProductosPanel } from "./ProductosPanel";
import styles from "../admin.module.css";

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sku?: string; categoria?: string; estado?: string; stock?: string; oferta?: string; destacado?: string }>;
}) {
  const { q, sku, categoria, estado, stock, oferta, destacado } = await searchParams;

  // El SKU que el almacén tiene a mano es el de la variante, no el código de
  // modelo del producto: buscar solo por `producto.sku` no encontraba nada.
  const coincideSku = (texto: string): Prisma.ProductoWhereInput => ({
    OR: [
      { sku: { contains: texto, mode: "insensitive" } },
      { variantes: { some: { sku: { contains: texto, mode: "insensitive" } } } },
    ],
  });

  // Van en AND y no sueltos en el objeto porque los dos usan `OR` y el segundo
  // pisaría al primero cuando se buscan texto y SKU a la vez.
  const busquedas: Prisma.ProductoWhereInput[] = [
    ...(q ? [{ OR: [{ nombre: { contains: q, mode: "insensitive" as const } }, coincideSku(q)] }] : []),
    ...(sku ? [coincideSku(sku)] : []),
  ];

  const where: Prisma.ProductoWhereInput = {
    ...(busquedas.length > 0 ? { AND: busquedas } : {}),
    ...(categoria ? { categoriaId: categoria } : {}),
    ...(estado === "activo" ? { activo: true } : {}),
    ...(estado === "inactivo" ? { activo: false } : {}),
    ...(oferta === "con" ? { precioOferta: { not: null } } : {}),
    ...(oferta === "sin" ? { precioOferta: null } : {}),
    ...(destacado === "si" ? { destacado: true } : {}),
  };

  const [productos, categorias] = await Promise.all([
    db.producto.findMany({
      where,
      orderBy: { creadoEn: "desc" },
      include: {
        // Solo lo que pinta la tabla: traer la variante entera de cada producto
        // arrastraba fechas, descripciones y portadas que nadie usa acá.
        variantes: {
          orderBy: [{ color: "asc" }, { talla: "asc" }],
          select: { id: true, sku: true, talla: true, color: true, precio: true, costo: true, cantidad: true, stockMinimo: true, activo: true },
        },
      },
    }),
    db.categoria.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);

  const filas = productos.map((producto) => {
    const stock = producto.variantes.reduce((total, variante) => total + variante.cantidad, 0);

    return {
      id: producto.id,
      nombre: producto.nombre,
      sku: producto.sku,
      // Decimal no es serializable hacia un componente cliente.
      precio: formatearPrecio(producto.precio.toString()),
      valorInventario: producto.variantes.reduce(
        (total, variante) =>
          total + Number(variante.costo ?? producto.costo ?? 0) * variante.cantidad,
        0,
      ),
      activo: producto.activo,
      stock,
      stockBajo: producto.variantes.some(
        (variante) => variante.activo && variante.cantidad <= variante.stockMinimo,
      ),
      variantes: producto.variantes.map((variante) => ({
        id: variante.id,
        // Un producto único no tiene talla ni color: su fila es la presentación.
        opciones: [variante.talla, variante.color].filter(Boolean).join(" / ") || "Única",
        sku: variante.sku,
        precio: formatearPrecio((variante.precio ?? producto.precio).toString()),
        cantidad: variante.cantidad,
        stockMinimo: variante.stockMinimo,
        activo: variante.activo,
      })),
    };
  });

  // "Stock bajo" se filtra acá porque depende de comparar dos columnas de la
  // variante, algo que el where de Prisma no expresa directamente.
  const visibles = filas.filter((fila) => {
    if (estado === "bajo" && !fila.stockBajo) return false;
    if (stock === "bajo" && (!fila.stockBajo || fila.stock === 0)) return false;
    if (stock === "agotado" && fila.stock !== 0) return false;
    if (stock === "disponible" && (fila.stock === 0 || fila.stockBajo)) return false;
    return true;
  });

  // Los resúmenes reflejan la búsqueda/categoría activa, pero no el filtro de
  // estado en sí: son la base sobre la que ese filtro se aplica.
  const totalActivos = filas.filter((fila) => fila.activo).length;
  const totalStockBajo = filas.filter((fila) => fila.stockBajo).length;
  const totalVariantes = filas.reduce((suma, fila) => suma + fila.variantes.length, 0);
  const valorInventarioTotal = filas.reduce((suma, fila) => suma + fila.valorInventario, 0);

  const parametrosStockBajo = new URLSearchParams();
  if (q) parametrosStockBajo.set("q", q);
  if (sku) parametrosStockBajo.set("sku", sku);
  if (categoria) parametrosStockBajo.set("categoria", categoria);
  parametrosStockBajo.set("estado", "bajo");

  return (
    <>
      <PageHeader titulo={destacado === "si" ? "Productos destacados" : "Productos"} descripcion={`${visibles.length} producto(s) en la lista.`}>
        <Link href="/admin/productos/nuevo" className={styles.boton}>
          Nuevo producto
        </Link>
      </PageHeader>

      <div className={`${styles.tarjetas} ${styles.tarjetasProductos}`}>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{filas.length}</div>
          <div className={styles.tarjetaLabel}>Productos en total</div>
        </div>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{totalActivos}</div>
          <div className={styles.tarjetaLabel}>Activos · {filas.length - totalActivos} inactivo(s)</div>
        </div>
        <Link href={`/admin/productos?${parametrosStockBajo.toString()}`} className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{totalStockBajo}</div>
          <div className={styles.tarjetaLabel}>Con stock bajo o agotado</div>
        </Link>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{totalVariantes}</div>
          <div className={styles.tarjetaLabel}>Variantes de talla y color</div>
        </div>
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaNumero}>{formatearPrecio(valorInventarioTotal)}</div>
          <div className={styles.tarjetaLabel}>Costo de inventario</div>
        </div>
      </div>

      <ProductosPanel productos={visibles} categorias={categorias} />
    </>
  );
}
