import { ProductoCard, type ProductoCardData } from "./ProductoCard";
import styles from "./ProductosGrid.module.css";

export function ProductosGrid({
  productos,
  etiqueta,
}: {
  productos: ProductoCardData[];
  etiqueta?: "nuevo";
}) {
  return (
    <div className={styles.grid}>
      {productos.map((producto, indice) => (
        <ProductoCard
          key={producto.varianteId ?? producto.slug}
          producto={producto}
          etiqueta={etiqueta}
          prioridad={indice < 4}
        />
      ))}
    </div>
  );
}
