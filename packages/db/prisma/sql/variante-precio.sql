-- El precio de una variante no puede ser negativo (centimos, entero). Prisma no expresa CHECK.
-- Idempotente: se puede ejecutar varias veces.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Variante_precio_no_negativo') THEN
    ALTER TABLE "Variante" ADD CONSTRAINT "Variante_precio_no_negativo" CHECK ("precio" >= 0);
  END IF;
END $$;
