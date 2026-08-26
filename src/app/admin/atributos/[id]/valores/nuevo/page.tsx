import { PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ValorForm } from "../ValorForm";

export default async function NuevoValorPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const atributo = await db.atributoCatalogo.findUnique({ where: { id }, select: { tipo: true } }); if (!atributo) notFound(); return <><PageHeader titulo="Nuevo valor" descripcion="Crea un valor para este atributo." /><ValorForm atributoId={id} esColor={atributo.tipo === "COLOR"} /></>; }
