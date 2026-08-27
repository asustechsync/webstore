ALTER TABLE "usuarios"
  ADD COLUMN "tipoDocumento" TEXT,
  ADD COLUMN "documento" TEXT;

CREATE UNIQUE INDEX "usuarios_documento_key" ON "usuarios"("documento");
