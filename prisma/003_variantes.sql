-- Variantes de producto (talla / color).
--
-- Reemplazan la tabla `stock`, que era 1-a-1 con producto y no permitía saber
-- cuántas unidades quedan de cada talla — imprescindible en una tienda de ropa.
-- El carrito y los pedidos pasan a apuntar a la variante concreta que se compra.

-- CreateTable
CREATE TABLE "variantes" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "talla" TEXT NOT NULL,
    -- '' (cadena vacía) en vez de NULL para que el índice único funcione:
    -- en Postgres dos NULL se consideran distintos entre sí.
    "color" TEXT NOT NULL DEFAULT '',
    "sku" TEXT NOT NULL,
    "precio" DECIMAL(10,2),
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variantes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "variantes_sku_key" ON "variantes"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "variantes_productoId_talla_color_key" ON "variantes"("productoId", "talla", "color");

-- CreateIndex
CREATE INDEX "variantes_productoId_idx" ON "variantes"("productoId");

-- AddForeignKey
ALTER TABLE "variantes" ADD CONSTRAINT "variantes_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Cada producto que ya existía recibe una variante "Única" que hereda su SKU
-- y el stock que tenía en la tabla `stock`, para no perder inventario.
INSERT INTO "variantes" ("id", "productoId", "talla", "color", "sku", "cantidad", "stockMinimo", "actualizadoEn")
SELECT
    gen_random_uuid()::text,
    p."id",
    'Única',
    '',
    p."sku",
    COALESCE(s."cantidad", 0),
    COALESCE(s."stockMinimo", 0),
    now()
FROM "productos" p
LEFT JOIN "stock" s ON s."productoId" = p."id";

-- DropTable
DROP TABLE "stock";

-- El carrito apunta ahora a la variante (la talla concreta que se agrega).
ALTER TABLE "items_carrito" DROP CONSTRAINT "items_carrito_productoId_fkey";
DROP INDEX "items_carrito_carritoId_productoId_key";
ALTER TABLE "items_carrito" DROP COLUMN "productoId";
ALTER TABLE "items_carrito" ADD COLUMN "varianteId" TEXT NOT NULL;

CREATE UNIQUE INDEX "items_carrito_carritoId_varianteId_key" ON "items_carrito"("carritoId", "varianteId");

ALTER TABLE "items_carrito" ADD CONSTRAINT "items_carrito_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "variantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Los pedidos también: RESTRICT para no poder borrar una variante ya vendida.
ALTER TABLE "items_pedido" DROP CONSTRAINT "items_pedido_productoId_fkey";
ALTER TABLE "items_pedido" DROP COLUMN "productoId";
ALTER TABLE "items_pedido" ADD COLUMN "varianteId" TEXT NOT NULL;

ALTER TABLE "items_pedido" ADD CONSTRAINT "items_pedido_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "variantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Campos propios de una tienda de ropa.
ALTER TABLE "productos" ADD COLUMN "material" TEXT;
ALTER TABLE "productos" ADD COLUMN "cuidados" TEXT;
ALTER TABLE "productos" ADD COLUMN "guiaTallas" TEXT;
