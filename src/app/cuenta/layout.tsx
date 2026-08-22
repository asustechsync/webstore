import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getUsuarioActual();

  if (!usuario) {
    redirect("/ingresar");
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
