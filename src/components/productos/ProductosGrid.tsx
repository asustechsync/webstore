import { ProductoCard, type ProductoCardData } from "./ProductoCard";
import styles from "./ProductosGrid.module.css";

export function ProductosGrid({ productos }: { productos: ProductoCardData[] }) {
  return (
    <div className={styles.grid}>
      {productos.map((producto) => (
        <ProductoCard key={producto.varianteId ?? producto.slug} producto={producto} />
      ))}
    </div>
  );
}
