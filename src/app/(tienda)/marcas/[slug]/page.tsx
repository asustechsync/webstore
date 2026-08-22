import { Container } from "@/components/ui/Container";

export default async function MarcaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main>
      <Container>
        <h1>Marca: {slug}</h1>
      </Container>
    </main>
  );
}
