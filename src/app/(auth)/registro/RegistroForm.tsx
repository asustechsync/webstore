"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registroSchema } from "@/features/usuarios/schemas";
import { decodificarClaims } from "@/lib/jwt";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "./RegistroForm.module.css";

export function RegistroForm() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  async function onSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    const formData = new FormData(evento.currentTarget);
    const resultado = registroSchema.safeParse({
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0].message);
      return;
    }

    setCargando(true);
    const supabase = createClient();
    const { nombre, email, password } = resultado.data;

    const { data, error: errorSignUp } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });

    if (errorSignUp || !data.user) {
      setError(errorSignUp?.message ?? "No se pudo crear la cuenta");
      setCargando(false);
      return;
    }

    // La fila en `usuarios` la crea un trigger de Postgres apenas Supabase
    // registra la cuenta — no hay nada que sincronizar acá.
    if (data.session) {
      const claims = decodificarClaims(data.session.access_token);
      router.push(claims.user_role === "ADMIN" ? "/admin" : "/cuenta");
      router.refresh();
    } else {
      setExito(true);
      setCargando(false);
    }
  }

  if (exito) {
    return <p>Revisa tu correo para confirmar tu cuenta antes de ingresar.</p>;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error && <p className={styles.mensajeError}>{error}</p>}
      <Input label="Nombre" name="nombre" type="text" required />
      <Input label="Correo" name="email" type="email" required />
      <Input label="Contraseña" name="password" type="password" required />
      <Button type="submit" disabled={cargando}>
        {cargando ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
      <p className={styles.enlace}>
        ¿Ya tienes cuenta? <Link href="/ingresar">Ingresa aquí</Link>
      </p>
    </form>
  );
}
