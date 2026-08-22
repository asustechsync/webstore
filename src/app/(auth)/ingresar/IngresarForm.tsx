"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/features/usuarios/schemas";
import { decodificarClaims } from "@/lib/jwt";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "../registro/RegistroForm.module.css";

export function IngresarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    const formData = new FormData(evento.currentTarget);
    const resultado = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0].message);
      return;
    }

    setCargando(true);
    const supabase = createClient();
    const { data, error: errorLogin } = await supabase.auth.signInWithPassword(resultado.data);

    if (errorLogin || !data.session) {
      setError("Correo o contraseña incorrectos");
      setCargando(false);
      return;
    }

    // El rol viene incluido en el token (hook de Supabase) — sin consulta extra.
    const claims = decodificarClaims(data.session.access_token);
    const rutaPorRol = claims.user_role === "ADMIN" ? "/admin" : "/cuenta";
    const redirectTo = searchParams.get("redirectTo") ?? rutaPorRol;

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error && <p className={styles.mensajeError}>{error}</p>}
      <Input label="Correo" name="email" type="email" required />
      <Input label="Contraseña" name="password" type="password" required />
      <Button type="submit" disabled={cargando}>
        {cargando ? "Ingresando..." : "Ingresar"}
      </Button>
      <p className={styles.enlace}>
        ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>
      </p>
    </form>
  );
}
