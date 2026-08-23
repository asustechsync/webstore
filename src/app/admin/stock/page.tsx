import { db } from "@/lib/db";
import { StockTabla } from "./StockTabla";
import styles from "../admin.module.css";

export default async function AdminStockPage() {
  const variantes = await db.variante.findMany({
    orderBy: [{ producto: { nombre: "asc" } }, { color: "asc" }, { talla: "asc" }],
    include: { producto: { select: { nombre: true } } },
  });

  const bajos = variantes.filter(
    (variante) => variante.activo && variante.cantidad <= variante.stockMinimo,
  ).length;

  return (
    <>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Stock</h1>
          <p className={styles.subtitulo}>
            {bajos > 0
              ? `${bajos} talla(s) en o por debajo de su mínimo.`
              : "Todas las tallas están por encima de su mínimo."}
          </p>
        </div>
      </div>

      <StockTabla
        variantes={variantes.map((variante) => ({
          varianteId: variante.id,
          producto: variante.producto.nombre,
          talla: variante.talla,
          color: variante.color,
          sku: variante.sku,
          cantidad: variante.cantidad,
          stockMinimo: variante.stockMinimo,
          activo: variante.activo,
        }))}
      />
    </>
  );
}
