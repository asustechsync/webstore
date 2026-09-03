import { z } from "zod";
import { CODIGOS_TIPO } from "../opciones";

// Los formularios mandan "" en los campos opcionales que quedaron vacíos;
// esto lo convierte en undefined antes de validar.
const opcional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((valor) => (valor === "" || valor === null ? undefined : valor), schema.optional());

export const imagenSchema = z.object({
  url: z.url("La imagen no tiene una URL válida"),
  publicId: z.string().min(1),
});

export const opcionProductoSchema = z.object({
  clave: z.string().min(1, "La opción necesita una clave"),
  nombre: z.string().min(1, "La opción necesita un nombre"),
  valores: z.array(z.string().trim().min(1)).min(1, "Agrega al menos un valor"),
});

export const atributoVarianteSchema = z.object({
  clave: z.string().min(1),
  valor: z.string().trim().min(1, "Todas las opciones necesitan un valor"),
});

export const varianteSchema = z.object({
  // Sin id = variante nueva; con id = variante existente que se actualiza.
  id: opcional(z.string().uuid()),
  // Vacío en un producto único: ahí la única variante no distingue nada y no
  // debe aparecer ningún selector en la ficha de la tienda.
  atributos: z.array(atributoVarianteSchema),
  sku: z.string().min(1, "Cada variante necesita su propio SKU"),
  precio: opcional(z.coerce.number().positive("El precio de la variante debe ser mayor a 0")),
  costo: opcional(z.coerce.number().min(0, "El costo no puede ser negativo")),
  cantidad: z.coerce.number().int().min(0, "La cantidad no puede ser negativa"),
  stockMinimo: z.coerce.number().int().min(0, "El mínimo no puede ser negativo"),
  activo: z.boolean().default(true),
  // Portada propia: sin ella la variante muestra la primera imagen del producto.
  imagenUrl: opcional(z.url("La imagen de la variante no tiene una URL válida")),
  imagenPublicId: opcional(z.string().min(1)),
});

export const productoSchema = z.object({
  nombre: z.string().min(3, "El nombre es muy corto"),
  slug: z.string().min(3, "El slug es muy corto"),
  descripcion: z.string().min(10, "Agrega una descripción más completa"),
  descripcionCorta: opcional(z.string().max(180, "La descripción corta admite hasta 180 caracteres")),
  skuInterno: opcional(z.string().max(80, "El SKU interno admite hasta 80 caracteres")),
  codigoBarras: opcional(z.string().max(80, "El código de barras admite hasta 80 caracteres")),
  proveedor: opcional(z.string().max(120, "El proveedor admite hasta 120 caracteres")),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  precioOferta: opcional(z.coerce.number().positive("El precio de oferta debe ser mayor a 0")),
  costo: opcional(z.coerce.number().min(0, "El costo no puede ser negativo")),
  sku: z.string().min(1, "El SKU es obligatorio"),
  modoVariantes: z.boolean().default(false),
  tipoProducto: opcional(z.string().min(1)),
  perfilOpciones: opcional(z.string().min(1)),
  categoriaId: z.string().uuid("Selecciona una categoría"),
  marcaId: opcional(z.string().uuid("Selecciona una marca válida")),
  material: opcional(z.string()),
  cuidados: opcional(z.string()),
  guiaTallas: opcional(z.string()),
  pesoKg: opcional(z.coerce.number().min(0, "El peso no puede ser negativo")),
  anchoCm: opcional(z.coerce.number().min(0, "El ancho no puede ser negativo")),
  altoCm: opcional(z.coerce.number().min(0, "El alto no puede ser negativo")),
  largoCm: opcional(z.coerce.number().min(0, "El largo no puede ser negativo")),
  tituloSeo: opcional(z.string().max(60, "El título SEO admite hasta 60 caracteres")),
  descripcionSeo: opcional(z.string().max(160, "La descripción SEO admite hasta 160 caracteres")),
  activo: z.boolean().default(true),
  destacado: z.boolean().default(false),
  opciones: z.array(opcionProductoSchema).default([]),
  variantes: z
    .array(varianteSchema)
    .min(1, "Genera al menos una variante; es lo que realmente se vende"),
  imagenes: z.array(imagenSchema).default([]),
}).superRefine((producto, contexto) => {
  if (producto.activo && producto.imagenes.length === 0) {
    contexto.addIssue({ code: "custom", path: ["imagenes"], message: "Agrega una imagen antes de publicar el producto" });
  }
  if (producto.activo && !producto.variantes.some((variante) => variante.activo)) {
    contexto.addIssue({ code: "custom", path: ["variantes"], message: "Activa al menos una variante antes de publicar" });
  }

  // Un producto único es un producto con exactamente una variante sin
  // atributos; uno con variantes necesita opciones declaradas. Validar el
  // modo acá evita que el formulario mande estados a medio camino.
  if (producto.modoVariantes) {
    if (producto.opciones.length === 0) {
      contexto.addIssue({ code: "custom", path: ["opciones"], message: "Agrega al menos un atributo (talla, color...) antes de guardar" });
    }
  } else {
    if (producto.opciones.length > 0 || producto.variantes.some((variante) => variante.atributos.length > 0)) {
      contexto.addIssue({ code: "custom", path: ["opciones"], message: "Un producto único no lleva atributos; cámbialo a producto con variantes" });
    }
    if (producto.variantes.length !== 1) {
      contexto.addIssue({ code: "custom", path: ["variantes"], message: "Un producto único solo puede tener una presentación" });
    }
  }

  const opciones = new Map<string, Set<string>>();

  producto.opciones.forEach((opcion, indice) => {
    if (opciones.has(opcion.clave)) {
      contexto.addIssue({
        code: "custom",
        path: ["opciones", indice, "clave"],
        message: "No puede haber opciones repetidas",
      });
    }
    opciones.set(opcion.clave, new Set(opcion.valores));
  });

  const combinaciones = new Set<string>();
  const skus = new Set<string>();

  producto.variantes.forEach((variante, indice) => {
    const atributos = new Map(variante.atributos.map((atributo) => [atributo.clave, atributo.valor]));

    for (const [clave, valores] of opciones) {
      const valor = atributos.get(clave);
      if (!valor || !valores.has(valor)) {
        contexto.addIssue({
          code: "custom",
          path: ["variantes", indice, "atributos"],
          message: `La variante no tiene un valor válido para ${clave}`,
        });
      }
    }

    const combinacion = [...atributos]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([clave, valor]) => `${clave}=${valor.toLocaleLowerCase("es")}`)
      .join("|");
    if (combinaciones.has(combinacion)) {
      contexto.addIssue({
        code: "custom",
        path: ["variantes", indice],
        message: "Hay dos variantes con la misma combinación de opciones",
      });
    }
    combinaciones.add(combinacion);

    const sku = variante.sku.toLocaleUpperCase("es");
    if (skus.has(sku)) {
      contexto.addIssue({
        code: "custom",
        path: ["variantes", indice, "sku"],
        message: "Los SKU de las variantes no se pueden repetir",
      });
    }
    skus.add(sku);
  });
});

export const productoBorradorSchema = z.object({
  nombre: z.string().trim().min(3, "Ingresa un nombre de al menos 3 caracteres"),
  categoriaId: z.string().uuid("Selecciona una categoría"),
  modoVariantes: z.boolean(),
  codigoTipo: z.enum(
    CODIGOS_TIPO.map((tipo) => tipo.codigo),
    "Selecciona un tipo de producto",
  ),
});

// z.input (no z.infer) porque los formularios mandan los números y opcionales
// como texto; la coerción y los valores por defecto se aplican al validar.
export type ProductoInput = z.input<typeof productoSchema>;
export type ProductoBorradorInput = z.input<typeof productoBorradorSchema>;
export type ProductoValidado = z.output<typeof productoSchema>;
export type VarianteInput = z.input<typeof varianteSchema>;
export type ImagenInput = z.input<typeof imagenSchema>;
