import { notFound } from "next/navigation";
import { obtenerProductoPorSlug } from "@/features/catalogo/queries";
import { Container } from "@/components/ui/Container";

export const revalidate = 300;

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = await obtenerProductoPorSlug(slug);

  if (!producto) notFound();

  return (
    <main>
      <Container>
        <h1>{producto.nombre}</h1>
        <p>{producto.descripcion}</p>
      </Container>
    </main>
  );
}
