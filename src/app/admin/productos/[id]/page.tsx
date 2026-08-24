import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { ProductoForm } from "../ProductoForm";

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
        opciones: {
          orderBy: { orden: "asc" },
          include: { valores: { orderBy: { orden: "asc" } } },
        },
        variantes: {
          orderBy: [{ color: "asc" }, { talla: "asc" }],
          include: {
            valores: { include: { valor: { include: { opcion: true } } } },
          },
        },
        imagenes: { orderBy: { orden: "asc" } },
      },
    }),
    db.categoria.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    db.marca.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);

  if (!producto) notFound();

  return (
    <>
      <PageHeader titulo="Editar producto" />

      <ProductoForm
        categorias={categorias}
        marcas={marcas}
        productoId={producto.id}
        valoresIniciales={{
          nombre: producto.nombre,
          slug: producto.slug,
          descripcion: producto.descripcion,
          descripcionCorta: producto.descripcionCorta ?? "",
          skuInterno: producto.skuInterno ?? "",
          codigoBarras: producto.codigoBarras ?? "",
          proveedor: producto.proveedor ?? "",
          // Decimal no es serializable hacia un componente cliente.
          precio: producto.precio.toString(),
          precioOferta: producto.precioOferta?.toString() ?? "",
          costo: producto.costo?.toString() ?? "",
          sku: producto.sku,
          tipoProducto: producto.tipoProducto ?? "GENERAL",
          perfilOpciones: producto.perfilOpciones ?? "personalizado",
          categoriaId: producto.categoriaId,
          marcaId: producto.marcaId ?? "",
          material: producto.material ?? "",
          cuidados: producto.cuidados ?? "",
          guiaTallas: producto.guiaTallas ?? "",
          activo: producto.activo,
          destacado: producto.destacado,
          opciones: producto.opciones.map((opcion) => ({
            clave: opcion.clave,
            nombre: opcion.nombre,
            valores: opcion.valores.map((valor) => valor.valor),
          })),
          variantes: producto.variantes.map((variante) => ({
            clave: variante.id,
            id: variante.id,
            atributos: variante.valores
              .sort((a, b) => a.valor.opcion.orden - b.valor.opcion.orden)
              .map(({ valor }) => ({ clave: valor.opcion.clave, valor: valor.valor })),
            sku: variante.sku,
            precio: variante.precio?.toString() ?? "",
            costo: variante.costo?.toString() ?? "",
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
