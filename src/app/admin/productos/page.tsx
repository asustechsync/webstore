import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import { FiltrosProductos } from "./FiltrosProductos";
import { ProductosTabla } from "./ProductosTabla";
import styles from "../admin.module.css";

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; estado?: string }>;
}) {
  const { q, categoria, estado } = await searchParams;

  const where: Prisma.ProductoWhereInput = {
    ...(q
      ? {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categoria ? { categoriaId: categoria } : {}),
    ...(estado === "activo" ? { activo: true } : {}),
    ...(estado === "inactivo" ? { activo: false } : {}),
  };

  const [productos, categorias] = await Promise.all([
    db.producto.findMany({
      where,
      orderBy: { creadoEn: "desc" },
      include: { categoria: true, marca: true, variantes: true },
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
      categoria: producto.categoria.nombre,
      marca: producto.marca?.nombre ?? "-",
      activo: producto.activo,
      tallas: producto.variantes.length,
      stock,
      stockBajo: producto.variantes.some(
        (variante) => variante.activo && variante.cantidad <= variante.stockMinimo,
      ),
    };
  });

  // "Stock bajo" se filtra acá porque depende de comparar dos columnas de la
  // variante, algo que el where de Prisma no expresa directamente.
  const visibles = estado === "bajo" ? filas.filter((fila) => fila.stockBajo) : filas;

  return (
    <>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Productos</h1>
          <p className={styles.subtitulo}>{visibles.length} producto(s) en la lista.</p>
        </div>
        <Link href="/admin/productos/nuevo" className={styles.boton}>
          Nuevo producto
        </Link>
      </div>

      <FiltrosProductos categorias={categorias} />
      <ProductosTabla productos={visibles} />
    </>
  );
}
