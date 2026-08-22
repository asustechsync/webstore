import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getUsuarioActual();

  if (!usuario || usuario.rol.nombre !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
