import type { Producto, ImagenProducto, Categoria, Marca, Stock } from "@prisma/client";

export type ProductoConRelaciones = Producto & {
  imagenes: ImagenProducto[];
  categoria: Categoria;
  marca: Marca | null;
  stock: Stock | null;
};
