import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import styles from "../admin.module.css";

export default async function AdminClientesPage() {
  const clientes = await db.usuario.findMany({
    where: { rol: { nombre: "CLIENTE" } },
    orderBy: { creadoEn: "desc" },
    include: { _count: { select: { pedidos: true, direcciones: true } } },
  });

  return (
    <>
      <PageHeader titulo="Clientes" descripcion={`${clientes.length} cliente(s) registrados.`} />

      {clientes.length === 0 ? (
        <p className={styles.vacio}>Todavía no hay clientes registrados.</p>
      ) : (
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Pedidos</th>
                <th>Direcciones</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{[cliente.nombre, cliente.apellidos].filter(Boolean).join(" ")}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente._count.pedidos}</td>
                  <td>{cliente._count.direcciones}</td>
                  <td>{cliente.creadoEn.toLocaleDateString("es-PE")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
