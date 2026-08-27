ALTER TABLE "usuarios"
  ADD COLUMN "apellidoPaterno" TEXT,
  ADD COLUMN "apellidoMaterno" TEXT,
  ADD COLUMN "fechaNacimiento" TIMESTAMP(3),
  ADD COLUMN "genero" TEXT,
  ADD COLUMN "dni" TEXT;

-- Conserva los apellidos existentes: el primer término pasa a ser paterno
-- y el resto queda como materno para que ningún perfil anterior pierda datos.
UPDATE "usuarios"
SET
  "apellidoPaterno" = NULLIF(split_part(trim("apellidos"), ' ', 1), ''),
  "apellidoMaterno" = NULLIF(NULLIF(trim(regexp_replace(trim("apellidos"), '^\\S+\\s*', '')), ''), '')
WHERE "apellidos" IS NOT NULL AND trim("apellidos") <> '';

CREATE UNIQUE INDEX "usuarios_dni_key" ON "usuarios"("dni");
