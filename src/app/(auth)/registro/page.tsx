import { Container } from "@/components/ui/Container";
import { BotonesOAuth } from "@/components/shared/BotonesOAuth";
import { RegistroForm } from "./RegistroForm";

export default function RegistroPage() {
  return (
    <main>
      <Container angosto>
        <h1>Crear cuenta</h1>
        <RegistroForm />
        <BotonesOAuth />
      </Container>
    </main>
  );
}
