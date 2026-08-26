import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerProductoPorSlug } from "@/features/catalogo/queries/productos";
import { Container } from "@/components/ui/Container";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await obtenerProductoPorSlug(slug);
  if (!producto) return {};
  return {
    title: producto.tituloSeo ?? producto.nombre,
    description: producto.descripcionSeo ?? producto.descripcionCorta ?? undefined,
  };
}

export default async function ProductoPage({
  params,
}: Props) {
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
