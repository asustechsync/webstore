-- Ejecutar una vez en la base de datos existente.
ALTER TABLE "productos"
  ADD COLUMN IF NOT EXISTS "skuInterno" TEXT,
  ADD COLUMN IF NOT EXISTS "codigoBarras" TEXT,
  ADD COLUMN IF NOT EXISTS "proveedor" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "productos_skuInterno_key"
  ON "productos"("skuInterno") WHERE "skuInterno" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "productos_codigoBarras_key"
  ON "productos"("codigoBarras") WHERE "codigoBarras" IS NOT NULL;
