ALTER TABLE "usuarios"
  ADD COLUMN IF NOT EXISTS "codigoPais" TEXT DEFAULT '+51';

UPDATE "usuarios"
SET "codigoPais" = '+51'
WHERE "codigoPais" IS NULL;
