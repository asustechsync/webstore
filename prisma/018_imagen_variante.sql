-- Foto propia por variante.
--
-- Hasta ahora las imágenes colgaban solo del producto (`imagenes_producto`),
-- así que las tres tarjetas de una media Blanco/Negro/Plomo mostraban la misma
-- foto. Cada variante guarda ahora su portada: una sola imagen, no una galería,
-- porque es lo que consumen la tarjeta del catálogo, el carrito y el pedido.
--
-- Las columnas son opcionales: una variante sin foto propia sigue mostrando la
-- portada del producto, que es el comportamiento actual.

ALTER TABLE "variantes"
  ADD COLUMN "imagenUrl" TEXT,
  ADD COLUMN "imagenPublicId" TEXT;
