import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { StockTabla } from "./StockTabla";
import styles from "../admin.module.css";

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro } = await searchParams;
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
  const visibles = filtro === "alertas"
    ? variantes.filter((variante) => variante.activo && variante.cantidad <= variante.stockMinimo)
    : variantes;

  return (
    <>
      <PageHeader
        titulo={filtro === "alertas" ? "Alertas de stock" : "Stock"}
        descripcion={
          filtro === "alertas"
            ? `${bajos} variante(s) requieren reposición.`
            : bajos > 0
            ? `${bajos} variante(s) en o por debajo de su mínimo.`
            : "Todas las variantes están por encima de su mínimo."
        }
      />

      <div className={styles.bloque}>
        <StockTabla
          variantes={visibles.map((variante) => ({
            varianteId: variante.id,
            producto: variante.producto.nombre,
            imagenUrl: variante.producto.imagenes[0]?.url ?? null,
            opciones: [variante.talla, variante.color].filter(Boolean).join(" / ") || "Única",
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
