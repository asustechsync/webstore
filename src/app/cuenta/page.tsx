import { getUsuarioActual } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { CerrarSesionBoton } from "./CerrarSesionBoton";

export default async function CuentaPage() {
  const usuario = await getUsuarioActual();

  return (
    <main>
      <Container>
        <h1>Hola, {usuario?.nombre}</h1>
        <p>Rol: {usuario?.rol.nombre}</p>
        <CerrarSesionBoton />
      </Container>
    </main>
  );
}
