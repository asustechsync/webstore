import type {
  Producto,
  ImagenProducto,
  Categoria,
  Marca,
  Variante,
} from "@prisma/client";

export type ProductoConRelaciones = Producto & {
  imagenes: ImagenProducto[];
  categoria: Categoria;
  marca: Marca | null;
  variantes: Variante[];
};
