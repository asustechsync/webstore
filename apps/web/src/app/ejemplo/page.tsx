import type { Metadata } from "next";
import { SoftCatalog } from "@/components/ejemplo/soft-catalog";
import { env } from "@/env";

export const metadata: Metadata = { title: "Ejemplo · estética suave" };

/** Propuesta visual (no forma parte de la hoja de ruta): catálogo con estética "suave". */
export default function EjemploPage() {
  return <SoftCatalog storeName={env.NEXT_PUBLIC_STORE_NAME} />;
}
