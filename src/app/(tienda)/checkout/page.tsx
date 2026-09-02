import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormularioCheckout } from "@/components/checkout/FormularioCheckout";
import { getUsuarioActual } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirma tu envío y método de pago.",
};

export default async function CheckoutPage() {
  // El pedido se guarda contra el usuario, así que el checkout exige sesión.
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/ingresar?redirectTo=/checkout");

  const [direcciones, datos] = await Promise.all([
    db.direccion.findMany({
      where: { usuarioId: usuario.id },
      orderBy: [{ predeterminada: "desc" }, { creadoEn: "desc" }],
    }),
    db.usuario.findUnique({
      where: { id: usuario.id },
      select: { nombre: true, apellidoPaterno: true, telefono: true },
    }),
  ]);

  const nombreCompleto = [datos?.nombre, datos?.apellidoPaterno].filter(Boolean).join(" ");

  return (
    <main>
      <Container>
        <PageHeader titulo="Checkout" descripcion="Confirma tu envío y cómo prefieres pagar" />
        <FormularioCheckout
          direcciones={direcciones.map((direccion) => ({
            id: direccion.id,
            destinatario: direccion.destinatario,
            telefono: direccion.telefono,
            departamento: direccion.departamento,
            provincia: direccion.provincia,
            distrito: direccion.distrito,
            direccion: direccion.direccion,
            referencia: direccion.referencia ?? "",
            codigoPostal: direccion.codigoPostal ?? "",
            predeterminada: direccion.predeterminada,
          }))}
          contacto={{ nombre: nombreCompleto, telefono: datos?.telefono ?? "" }}
        />
      </Container>
    </main>
  );
}
