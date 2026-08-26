import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { ValoresAtributoPanel } from "./ValoresAtributoPanel";

export default async function AtributoValoresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const atributo = await db.atributoCatalogo.findUnique({ where: { id }, include: { valores: { orderBy: { orden: "asc" } } } });
  if (!atributo) notFound();
  return <><PageHeader titulo={atributo.nombre} descripcion={`Administra los valores de ${atributo.nombre}.`}><Link href="/admin/atributos" className="botonSecundario">Volver a atributos</Link></PageHeader><ValoresAtributoPanel atributoId={atributo.id} nombre={atributo.nombre} esColor={atributo.tipo === "COLOR"} valores={atributo.valores.map((valor) => ({ id: valor.id, valor: valor.valor, orden: valor.orden, colorHex: valor.colorHex }))} /></>;
}
