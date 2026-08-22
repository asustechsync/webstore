import Link from "next/link";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";

export default async function AdminProductosPage() {
  const productos = await db.producto.findMany({
    orderBy: { creadoEn: "desc" },
    include: { categoria: true, marca: true },
  });

  return (
    <main>
      <Container>
        <div className={styles.encabezado}>
          <h1>Productos</h1>
          <Link href="/admin/productos/nuevo" className={styles.botonNuevo}>
            Nuevo producto
          </Link>
        </div>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th>Marca</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/productos/${p.id}`}>{p.nombre}</Link>
                </td>
                <td>{p.sku}</td>
                <td>{p.categoria.nombre}</td>
                <td>{p.marca?.nombre ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </main>
  );
}
