import assert from "node:assert/strict";
import test from "node:test";
import { atributoCatalogoSchema } from "../src/features/catalogo/schemas/atributos";
import { categoriaSchema } from "../src/features/catalogo/schemas/categorias";
import { marcaSchema } from "../src/features/catalogo/schemas/marcas";

test("los formularios convierten opcionales vacíos en undefined", () => {
  const categoria = categoriaSchema.parse({
    nombre: "Medias",
    slug: "medias",
    descripcion: "",
    imagenUrl: "",
    orden: "0",
    destacada: false,
    tituloSeo: "",
    descripcionSeo: "",
    padreId: "",
    activo: true,
  });

  assert.equal(categoria.descripcion, undefined);
  assert.equal(categoria.padreId, undefined);
});

test("una marca rechaza URLs de logo inválidas", () => {
  const resultado = marcaSchema.safeParse({
    nombre: "Prueba",
    slug: "prueba",
    logoUrl: "no-es-url",
    activo: true,
  });
  assert.equal(resultado.success, false);
});

test("un atributo no permite valores repetidos ignorando mayúsculas", () => {
  const resultado = atributoCatalogoSchema.safeParse({
    nombre: "Color",
    clave: "color",
    tipo: "COLOR",
    valores: ["Negro", "negro"],
    activo: true,
  });
  assert.equal(resultado.success, false);
});
