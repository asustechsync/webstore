-- Campos de presentación y posicionamiento para las categorías públicas.
ALTER TABLE categorias
  ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS destacada BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS titulo_seo TEXT,
  ADD COLUMN IF NOT EXISTS descripcion_seo TEXT;

CREATE INDEX IF NOT EXISTS categorias_activo_orden_idx ON categorias (activo, orden);
