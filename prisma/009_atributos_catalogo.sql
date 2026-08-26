-- Atributos reutilizables que se copian al configurar variantes de un producto.
CREATE TABLE IF NOT EXISTS atributos_catalogo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  clave TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'LISTA',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT atributos_catalogo_tipo_check CHECK (tipo IN ('LISTA', 'COLOR'))
);

CREATE TABLE IF NOT EXISTS valores_atributo_catalogo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atributo_id UUID NOT NULL REFERENCES atributos_catalogo(id) ON DELETE CASCADE,
  valor TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT valores_atributo_catalogo_unico UNIQUE (atributo_id, valor)
);

CREATE INDEX IF NOT EXISTS valores_atributo_catalogo_atributo_idx ON valores_atributo_catalogo (atributo_id);

INSERT INTO atributos_catalogo (nombre, clave, tipo)
VALUES ('Talla', 'talla', 'LISTA'), ('Color', 'color', 'COLOR'), ('Diseño', 'diseno', 'LISTA'), ('Copa', 'copa', 'LISTA'), ('Contorno', 'contorno', 'LISTA')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO valores_atributo_catalogo (atributo_id, valor, orden)
SELECT atributo.id, valores.valor, valores.orden
FROM atributos_catalogo atributo
JOIN (VALUES
  ('talla', 'XS', 0), ('talla', 'S', 1), ('talla', 'M', 2), ('talla', 'L', 3), ('talla', 'XL', 4), ('talla', 'XXL', 5),
  ('color', 'Negro', 0), ('color', 'Blanco', 1), ('color', 'Gris', 2), ('color', 'Azul', 3), ('color', 'Rojo', 4),
  ('diseno', 'Liso', 0), ('diseno', 'Rayas', 1), ('diseno', 'Estampado', 2),
  ('copa', 'A', 0), ('copa', 'B', 1), ('copa', 'C', 2), ('copa', 'D', 3),
  ('contorno', '32', 0), ('contorno', '34', 1), ('contorno', '36', 2), ('contorno', '38', 3), ('contorno', '40', 4)
) AS valores(clave, valor, orden) ON valores.clave = atributo.clave
ON CONFLICT (atributo_id, valor) DO NOTHING;
