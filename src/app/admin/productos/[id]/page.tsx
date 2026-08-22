import { Container } from "@/components/ui/Container";

export default async function AdminEditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <Container>
        <h1>Editar producto {id}</h1>
      </Container>
    </main>
  );
}
