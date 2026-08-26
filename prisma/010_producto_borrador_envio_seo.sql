ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS borrador BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "modoVariantes" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "pesoKg" DECIMAL(8, 3),
  ADD COLUMN IF NOT EXISTS "anchoCm" DECIMAL(8, 2),
  ADD COLUMN IF NOT EXISTS "altoCm" DECIMAL(8, 2),
  ADD COLUMN IF NOT EXISTS "largoCm" DECIMAL(8, 2),
  ADD COLUMN IF NOT EXISTS "tituloSeo" TEXT,
  ADD COLUMN IF NOT EXISTS "descripcionSeo" TEXT;

-- Los productos históricos ya terminados no deben aparecer como borradores.
UPDATE productos SET borrador = FALSE WHERE activo = TRUE;
