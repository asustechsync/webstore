import { listarProductos } from "@/features/catalogo/queries";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";

export const revalidate = 300; // ISR: 5 minutos

export default async function ProductosPage() {
  const { productos } = await listarProductos();

  return (
    <main>
      <Container>
        <h1>Productos</h1>
        <ul className={styles.grid}>
          {productos.map((producto) => (
            <li key={producto.id} className={styles.tarjeta}>
              {producto.nombre}
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
