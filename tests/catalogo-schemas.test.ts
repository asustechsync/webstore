import assert from "node:assert/strict";
import test from "node:test";
import { atributoCatalogoSchema } from "../src/features/catalogo/schemas/atributos";
import { categoriaSchema } from "../src/features/catalogo/schemas/categorias";
import { marcaSchema } from "../src/features/catalogo/schemas/marcas";
import { productoSchema } from "../src/features/catalogo/schemas/productos";

const CATEGORIA = "3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";

/** Producto válido mínimo; cada prueba cambia solo lo que quiere comprobar. */
function producto(cambios: Record<string, unknown> = {}) {
  return {
    nombre: "Polo básico",
    slug: "polo-basico",
    descripcion: "Un polo de algodón para el día a día.",
    precio: "39.90",
    sku: "PR-001",
    categoriaId: CATEGORIA,
    activo: false,
    destacado: false,
    modoVariantes: false,
    opciones: [],
    variantes: [{ atributos: [], sku: "PR-001", cantidad: "5", stockMinimo: "1", activo: true }],
    imagenes: [],
    ...cambios,
  };
}

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

test("un producto único se guarda sin opciones ni atributos", () => {
  const resultado = productoSchema.safeParse(producto());
  assert.equal(resultado.success, true);
});

test("un producto único no admite atributos ni más de una presentación", () => {
  const conAtributos = productoSchema.safeParse(producto({
    opciones: [{ clave: "talla", nombre: "Talla", valores: ["M"] }],
    variantes: [{ atributos: [{ clave: "talla", valor: "M" }], sku: "PR-001M", cantidad: "5", stockMinimo: "1", activo: true }],
  }));
  assert.equal(conAtributos.success, false);

  const conDos = productoSchema.safeParse(producto({
    variantes: [
      { atributos: [], sku: "PR-001", cantidad: "5", stockMinimo: "1", activo: true },
      { atributos: [], sku: "PR-002", cantidad: "5", stockMinimo: "1", activo: true },
    ],
  }));
  assert.equal(conDos.success, false);
});

test("un producto con variantes exige al menos un atributo", () => {
  const sinOpciones = productoSchema.safeParse(producto({ modoVariantes: true }));
  assert.equal(sinOpciones.success, false);

  const completo = productoSchema.safeParse(producto({
    modoVariantes: true,
    opciones: [{ clave: "talla", nombre: "Talla", valores: ["M", "L"] }],
    variantes: [
      { atributos: [{ clave: "talla", valor: "M" }], sku: "PR001M", cantidad: "5", stockMinimo: "1", activo: true },
      { atributos: [{ clave: "talla", valor: "L" }], sku: "PR001L", cantidad: "2", stockMinimo: "1", activo: true },
    ],
  }));
  assert.equal(completo.success, true);
});

test("dos variantes no pueden compartir combinación ni SKU", () => {
  const base = {
    modoVariantes: true,
    opciones: [{ clave: "talla", nombre: "Talla", valores: ["M", "L"] }],
  };

  const combinacionRepetida = productoSchema.safeParse(producto({
    ...base,
    variantes: [
      { atributos: [{ clave: "talla", valor: "M" }], sku: "PR001M", cantidad: "1", stockMinimo: "0", activo: true },
      { atributos: [{ clave: "talla", valor: "M" }], sku: "PR001M2", cantidad: "1", stockMinimo: "0", activo: true },
    ],
  }));
  assert.equal(combinacionRepetida.success, false);

  const skuRepetido = productoSchema.safeParse(producto({
    ...base,
    variantes: [
      { atributos: [{ clave: "talla", valor: "M" }], sku: "PR001M", cantidad: "1", stockMinimo: "0", activo: true },
      { atributos: [{ clave: "talla", valor: "L" }], sku: "pr001m", cantidad: "1", stockMinimo: "0", activo: true },
    ],
  }));
  assert.equal(skuRepetido.success, false);
});

test("publicar exige imagen y al menos una variante activa", () => {
  const sinImagen = productoSchema.safeParse(producto({ activo: true }));
  assert.equal(sinImagen.success, false);

  const sinActivas = productoSchema.safeParse(producto({
    activo: true,
    imagenes: [{ url: "https://ejemplo.test/foto.jpg", publicId: "foto" }],
    variantes: [{ atributos: [], sku: "PR-001", cantidad: "5", stockMinimo: "1", activo: false }],
  }));
  assert.equal(sinActivas.success, false);
});
