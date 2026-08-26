import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { listarCategorias } from "@/features/catalogo/queries";
import styles from "./page.module.css";

export default async function CategoriasPage() {
  const categorias = await listarCategorias();

  return (
    <main>
      <Container>
        <h1>Categorías</h1>
        {categorias.length === 0 ? (
          <p className={styles.vacio}>Todavía no hay categorías disponibles.</p>
        ) : (
          <div className={styles.grid}>
            {categorias.map((categoria) => (
              <Link key={categoria.id} href={`/categorias/${categoria.slug}`} className={styles.tarjeta}>
                {categoria.imagenUrl ? <img src={categoria.imagenUrl} alt="" className={styles.imagen} /> : <div className={styles.imagenVacia} />}
                <div className={styles.contenido}>
                  <h2>{categoria.nombre}</h2>
                  {categoria.descripcion && <p>{categoria.descripcion}</p>}
                  <span>{categoria._count.productos} producto{categoria._count.productos === 1 ? "" : "s"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
