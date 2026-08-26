import { z } from "zod";
import { opcional } from "./comunes";

export const atributoCatalogoSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es muy corto"),
  clave: z.string().trim().min(2, "La clave es muy corta").regex(
    /^[a-z0-9_]+$/,
    "Usa solo letras, números o guion bajo",
  ),
  tipo: z.enum(["LISTA", "COLOR"]),
  valores: z.array(z.string().trim().min(1, "Cada valor debe tener contenido")).default([]),
  activo: z.boolean().default(true),
}).superRefine((atributo, contexto) => {
  const valores = new Set<string>();
  atributo.valores.forEach((valor, indice) => {
    const clave = valor.toLocaleLowerCase("es");
    if (valores.has(clave)) {
      contexto.addIssue({
        code: "custom",
        path: ["valores", indice],
        message: "No repitas valores",
      });
    }
    valores.add(clave);
  });
});

export const valorAtributoCatalogoSchema = z.object({
  valor: z.string().trim().min(1, "Ingresa un valor").max(80, "El valor admite hasta 80 caracteres"),
  colorHex: opcional(z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Selecciona un color válido")),
});

export type AtributoCatalogoInput = z.input<typeof atributoCatalogoSchema>;
export type ValorAtributoCatalogoInput = z.input<typeof valorAtributoCatalogoSchema>;
