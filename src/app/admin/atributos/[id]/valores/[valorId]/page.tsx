import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { ValorForm } from "../ValorForm";

export default async function EditarValorPage({ params }: { params: Promise<{ id: string; valorId: string }> }) { const { id, valorId } = await params; const valor = await db.valorAtributoCatalogo.findFirst({ where: { id: valorId, atributoId: id }, include: { atributo: { select: { tipo: true } } } }); if (!valor) notFound(); return <><PageHeader titulo="Editar valor" descripcion="Actualiza este valor de atributo." /><ValorForm atributoId={id} valorId={valor.id} valorInicial={valor.valor} colorHexInicial={valor.colorHex ?? ""} esColor={valor.atributo.tipo === "COLOR"} /></>; }
