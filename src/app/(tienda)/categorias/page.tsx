import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoriaCard } from "@/components/categorias/CategoriaCard";
import { listarCategorias } from "@/features/catalogo/queries/categorias";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Explora el catálogo de Webstore por categoría.",
};

export default async function CategoriasPage() {
  const categorias = await listarCategorias();

  return (
    <main>
      <Container>
        <PageHeader
          titulo="Categorías"
          descripcion={
            categorias.length > 0
              ? `${categorias.length} categoría${categorias.length === 1 ? "" : "s"} disponible${categorias.length === 1 ? "" : "s"}`
              : undefined
          }
        />

        {categorias.length === 0 ? (
          <EstadoVacio
            titulo="Todavía no hay categorías"
            descripcion="Estamos organizando el catálogo. Mientras tanto puedes ver todos los productos."
            accion={{ href: "/productos", texto: "Ver productos" }}
          />
        ) : (
          <div className={styles.grid}>
            {categorias.map((categoria) => (
              <CategoriaCard
                key={categoria.id}
                mostrarDescripcion
                categoria={{
                  id: categoria.id,
                  nombre: categoria.nombre,
                  slug: categoria.slug,
                  descripcion: categoria.descripcion,
                  imagenUrl: categoria.imagenUrl,
                  totalProductos: categoria._count.productos,
                }}
              />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
