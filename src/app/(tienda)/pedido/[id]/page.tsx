import { Container } from "@/components/ui/Container";

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <Container>
        <h1>Pedido #{id}</h1>
      </Container>
    </main>
  );
}
