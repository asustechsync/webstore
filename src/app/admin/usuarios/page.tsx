import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";

export default async function AdminUsuariosPage() {
  const usuarios = await db.usuario.findMany({
    include: { rol: true },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <main>
      <Container>
        <h1>Usuarios</h1>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.rol.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </main>
  );
}
