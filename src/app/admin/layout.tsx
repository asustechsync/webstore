import Link from "next/link";
import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/auth";
import { CerrarSesionBoton } from "@/app/cuenta/CerrarSesionBoton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AdminNav } from "./AdminNav";
import styles from "./admin.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getUsuarioActual();

  if (!usuario || usuario.rol.nombre !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className={styles.shell}>
      <div className={styles.shellInterior}>
        <header className={styles.barra}>
          <span className={styles.marca}>Administración</span>
          <div className={styles.barraDerecha}>
            <Link href="/" className={styles.enlaceTienda}>
              Ver tienda
            </Link>
            <span>{usuario.nombre}</span>
            <ThemeToggle />
            <div className={styles.salir}>
              <CerrarSesionBoton />
            </div>
          </div>
        </header>

        <div className={styles.cuerpo}>
          <AdminNav />
          <main className={styles.contenido}>{children}</main>
        </div>
      </div>
    </div>
  );
}
