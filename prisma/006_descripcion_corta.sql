-- Ejecutar una vez en la base de datos existente.
ALTER TABLE "productos"
ADD COLUMN IF NOT EXISTS "descripcionCorta" TEXT;
