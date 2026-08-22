import { Container } from "@/components/ui/Container";

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main>
      <Container>
        <h1>Categoría: {slug}</h1>
      </Container>
    </main>
  );
}
