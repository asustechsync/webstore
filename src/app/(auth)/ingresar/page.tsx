import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { BotonesOAuth } from "@/components/shared/BotonesOAuth";
import { IngresarForm } from "./IngresarForm";

export default function IngresarPage() {
  return (
    <main>
      <Container angosto>
        <h1>Ingresar</h1>
        <Suspense>
          <IngresarForm />
        </Suspense>
        <BotonesOAuth />
      </Container>
    </main>
  );
}
