-- Color opcional para los valores de atributos tipo COLOR.
ALTER TABLE "valores_atributo_catalogo"
  ADD COLUMN IF NOT EXISTS "color_hex" TEXT;
