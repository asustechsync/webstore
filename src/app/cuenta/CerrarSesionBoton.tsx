"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function CerrarSesionBoton({
  className,
  children = "Cerrar sesión",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variante="peligro" className={className} onClick={cerrarSesion}>
      {children}
    </Button>
  );
}
