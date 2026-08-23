import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductoForm } from "../ProductoForm";
import styles from "../../admin.module.css";

export default async function AdminEditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [producto, categorias, marcas] = await Promise.all([
    db.producto.findUnique({
      where: { id },
      include: {
        variantes: { orderBy: [{ color: "asc" }, { talla: "asc" }] },
        imagenes: { orderBy: { orden: "asc" } },
      },
    }),
    db.categoria.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    db.marca.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);

  if (!producto) notFound();

  return (
    <>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Editar producto</h1>
      </div>

      <ProductoForm
        categorias={categorias}
        marcas={marcas}
        productoId={producto.id}
        valoresIniciales={{
          nombre: producto.nombre,
          slug: producto.slug,
          descripcion: producto.descripcion,
          // Decimal no es serializable hacia un componente cliente.
          precio: producto.precio.toString(),
          precioOferta: producto.precioOferta?.toString() ?? "",
          sku: producto.sku,
          categoriaId: producto.categoriaId,
          marcaId: producto.marcaId ?? "",
          material: producto.material ?? "",
          cuidados: producto.cuidados ?? "",
          guiaTallas: producto.guiaTallas ?? "",
          activo: producto.activo,
          destacado: producto.destacado,
          variantes: producto.variantes.map((variante) => ({
            clave: variante.id,
            id: variante.id,
            talla: variante.talla,
            color: variante.color,
            sku: variante.sku,
            precio: variante.precio?.toString() ?? "",
            cantidad: String(variante.cantidad),
            stockMinimo: String(variante.stockMinimo),
            activo: variante.activo,
          })),
          imagenes: producto.imagenes.map((imagen) => ({
            url: imagen.url,
            publicId: imagen.publicId,
          })),
        }}
      />
    </>
  );
}
