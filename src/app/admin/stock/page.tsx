import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { StockTabla } from "./StockTabla";
import styles from "../admin.module.css";

export default async function AdminStockPage() {
  const variantes = await db.variante.findMany({
    orderBy: [{ producto: { nombre: "asc" } }, { color: "asc" }, { talla: "asc" }],
    include: {
      producto: {
        select: {
          nombre: true,
          imagenes: { orderBy: { orden: "asc" }, take: 1, select: { url: true } },
        },
      },
    },
  });

  const bajos = variantes.filter(
    (variante) => variante.activo && variante.cantidad <= variante.stockMinimo,
  ).length;

  return (
    <>
      <PageHeader
        titulo="Stock"
        descripcion={
          bajos > 0
            ? `${bajos} variante(s) en o por debajo de su mínimo.`
            : "Todas las variantes están por encima de su mínimo."
        }
      />

      <div className={styles.bloque}>
        <StockTabla
          variantes={variantes.map((variante) => ({
            varianteId: variante.id,
            producto: variante.producto.nombre,
            imagenUrl: variante.producto.imagenes[0]?.url ?? null,
            opciones: [variante.talla, variante.color].filter(Boolean).join(" / "),
            sku: variante.sku,
            cantidad: variante.cantidad,
            stockMinimo: variante.stockMinimo,
            activo: variante.activo,
            actualizadoEn: variante.actualizadoEn.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
