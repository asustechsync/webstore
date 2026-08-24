-- Opciones flexibles, costos y margen histórico.
-- La migración conserva talla/color y crea sus equivalentes en el nuevo
-- sistema para que los productos existentes sigan funcionando.

ALTER TABLE "productos"
  ADD COLUMN IF NOT EXISTS "costo" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "tipoProducto" TEXT,
  ADD COLUMN IF NOT EXISTS "perfilOpciones" TEXT;

ALTER TABLE "variantes"
  ADD COLUMN IF NOT EXISTS "costo" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "claveOpciones" TEXT;

UPDATE "variantes"
SET "claveOpciones" = 'talla=' || lower(trim("talla")) ||
  CASE WHEN "color" <> '' THEN '|color=' || lower(trim("color")) ELSE '' END
WHERE "claveOpciones" IS NULL;

ALTER TABLE "variantes" ALTER COLUMN "claveOpciones" SET NOT NULL;
DROP INDEX IF EXISTS "variantes_productoId_talla_color_key";
CREATE UNIQUE INDEX IF NOT EXISTS "variantes_productoId_claveOpciones_key"
  ON "variantes"("productoId", "claveOpciones");

ALTER TABLE "items_pedido"
  ADD COLUMN IF NOT EXISTS "costoUnit" DECIMAL(10,2);

CREATE TABLE IF NOT EXISTS "opciones_producto" (
  "id" TEXT NOT NULL,
  "productoId" TEXT NOT NULL,
  "clave" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "orden" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "opciones_producto_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "opciones_producto_productoId_fkey"
    FOREIGN KEY ("productoId") REFERENCES "productos"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "opciones_producto_productoId_clave_key"
  ON "opciones_producto"("productoId", "clave");
CREATE INDEX IF NOT EXISTS "opciones_producto_productoId_idx"
  ON "opciones_producto"("productoId");

CREATE TABLE IF NOT EXISTS "valores_opcion_producto" (
  "id" TEXT NOT NULL,
  "opcionId" TEXT NOT NULL,
  "valor" TEXT NOT NULL,
  "orden" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "valores_opcion_producto_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "valores_opcion_producto_opcionId_fkey"
    FOREIGN KEY ("opcionId") REFERENCES "opciones_producto"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "valores_opcion_producto_opcionId_valor_key"
  ON "valores_opcion_producto"("opcionId", "valor");
CREATE INDEX IF NOT EXISTS "valores_opcion_producto_opcionId_idx"
  ON "valores_opcion_producto"("opcionId");

CREATE TABLE IF NOT EXISTS "valores_variante" (
  "varianteId" TEXT NOT NULL,
  "valorId" TEXT NOT NULL,
  CONSTRAINT "valores_variante_pkey" PRIMARY KEY ("varianteId", "valorId"),
  CONSTRAINT "valores_variante_varianteId_fkey"
    FOREIGN KEY ("varianteId") REFERENCES "variantes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "valores_variante_valorId_fkey"
    FOREIGN KEY ("valorId") REFERENCES "valores_opcion_producto"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "valores_variante_valorId_idx"
  ON "valores_variante"("valorId");

-- Convierte las tallas existentes en una opción configurable.
INSERT INTO "opciones_producto" ("id", "productoId", "clave", "nombre", "orden")
SELECT gen_random_uuid()::text, p."id", 'talla', 'Talla', 0
FROM "productos" p
WHERE EXISTS (SELECT 1 FROM "variantes" v WHERE v."productoId" = p."id")
ON CONFLICT ("productoId", "clave") DO NOTHING;

INSERT INTO "valores_opcion_producto" ("id", "opcionId", "valor", "orden")
SELECT gen_random_uuid()::text, o."id", v."talla",
       ROW_NUMBER() OVER (PARTITION BY o."id" ORDER BY v."talla") - 1
FROM "opciones_producto" o
JOIN "variantes" v ON v."productoId" = o."productoId"
WHERE o."clave" = 'talla'
GROUP BY o."id", v."talla"
ON CONFLICT ("opcionId", "valor") DO NOTHING;

INSERT INTO "valores_variante" ("varianteId", "valorId")
SELECT v."id", vo."id"
FROM "variantes" v
JOIN "opciones_producto" o
  ON o."productoId" = v."productoId" AND o."clave" = 'talla'
JOIN "valores_opcion_producto" vo
  ON vo."opcionId" = o."id" AND vo."valor" = v."talla"
ON CONFLICT DO NOTHING;

-- Congela automáticamente el costo cuando se crea una línea de pedido. Esto
-- protege los reportes históricos aunque el checkout futuro omita el campo.
CREATE OR REPLACE FUNCTION asignar_costo_item_pedido()
RETURNS trigger AS $$
BEGIN
  IF NEW."costoUnit" IS NULL THEN
    SELECT COALESCE(v."costo", p."costo")
      INTO NEW."costoUnit"
    FROM "variantes" v
    JOIN "productos" p ON p."id" = v."productoId"
    WHERE v."id" = NEW."varianteId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "items_pedido_asignar_costo" ON "items_pedido";
CREATE TRIGGER "items_pedido_asignar_costo"
BEFORE INSERT ON "items_pedido"
FOR EACH ROW EXECUTE FUNCTION asignar_costo_item_pedido();

-- Los pedidos existentes no tenían snapshot. Se congela el mejor costo
-- disponible hoy para que, desde esta migración, ya no cambie en el tiempo.
UPDATE "items_pedido" ip
SET "costoUnit" = COALESCE(v."costo", p."costo")
FROM "variantes" v
JOIN "productos" p ON p."id" = v."productoId"
WHERE ip."varianteId" = v."id" AND ip."costoUnit" IS NULL;

-- Solo crea Color para productos que realmente lo utilizan.
INSERT INTO "opciones_producto" ("id", "productoId", "clave", "nombre", "orden")
SELECT gen_random_uuid()::text, p."id", 'color', 'Color', 1
FROM "productos" p
WHERE EXISTS (
  SELECT 1 FROM "variantes" v
  WHERE v."productoId" = p."id" AND v."color" <> ''
)
ON CONFLICT ("productoId", "clave") DO NOTHING;

INSERT INTO "valores_opcion_producto" ("id", "opcionId", "valor", "orden")
SELECT gen_random_uuid()::text, o."id", v."color",
       ROW_NUMBER() OVER (PARTITION BY o."id" ORDER BY v."color") - 1
FROM "opciones_producto" o
JOIN "variantes" v ON v."productoId" = o."productoId"
WHERE o."clave" = 'color' AND v."color" <> ''
GROUP BY o."id", v."color"
ON CONFLICT ("opcionId", "valor") DO NOTHING;

INSERT INTO "valores_variante" ("varianteId", "valorId")
SELECT v."id", vo."id"
FROM "variantes" v
JOIN "opciones_producto" o
  ON o."productoId" = v."productoId" AND o."clave" = 'color'
JOIN "valores_opcion_producto" vo
  ON vo."opcionId" = o."id" AND vo."valor" = v."color"
WHERE v."color" <> ''
ON CONFLICT DO NOTHING;
