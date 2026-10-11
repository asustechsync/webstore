-- Cada valor de atributo usa exactamente una columna valor* (texto, numero o booleano).
-- Prisma no expresa CHECK. Idempotente: se puede ejecutar varias veces.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductoAtributoValor_un_solo_valor') THEN
    ALTER TABLE "ProductoAtributoValor" ADD CONSTRAINT "ProductoAtributoValor_un_solo_valor"
      CHECK (num_nonnulls("valorTexto", "valorNumero", "valorBooleano") = 1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VarianteAtributoValor_un_solo_valor') THEN
    ALTER TABLE "VarianteAtributoValor" ADD CONSTRAINT "VarianteAtributoValor_un_solo_valor"
      CHECK (num_nonnulls("valorTexto", "valorNumero", "valorBooleano") = 1);
  END IF;
END $$;
