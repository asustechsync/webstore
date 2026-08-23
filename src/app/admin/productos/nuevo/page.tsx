import { db } from "@/lib/db";
import { ProductoForm } from "../ProductoForm";
import styles from "../../admin.module.css";

export default async function AdminNuevoProductoPage() {
  const [categorias, marcas] = await Promise.all([
    db.categoria.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    db.marca.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);

  return (
    <>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Nuevo producto</h1>
      </div>

      <ProductoForm categorias={categorias} marcas={marcas} />
    </>
  );
}
