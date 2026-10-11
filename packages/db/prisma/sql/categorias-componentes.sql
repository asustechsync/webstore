-- Departamento "Componentes" con sus categorias y subcategorias.
-- Idempotente: se puede ejecutar varias veces (upsert por slug).
-- Fuente: docs/estructura-categorias.md

-- 1. Departamento (nivel 1, sin padre)
INSERT INTO "Categoria" ("id", "nombre", "slug", "padreId", "destacada", "orden", "metaTitulo", "metaDescripcion", "actualizadoEn")
VALUES (
  'cat_componentes', 'Componentes', 'componentes', NULL, true, 1,
  'Componentes de PC',
  'Procesadores, placas madre, memorias RAM, tarjetas de video y todo lo necesario para armar tu computadora.',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "nombre" = EXCLUDED."nombre",
  "padreId" = EXCLUDED."padreId",
  "destacada" = EXCLUDED."destacada",
  "orden" = EXCLUDED."orden",
  "metaTitulo" = EXCLUDED."metaTitulo",
  "metaDescripcion" = EXCLUDED."metaDescripcion",
  "actualizadoEn" = CURRENT_TIMESTAMP;

-- 2. Categorias (nivel 2, hijas del departamento)
INSERT INTO "Categoria" ("id", "nombre", "slug", "padreId", "destacada", "orden", "metaTitulo", "metaDescripcion", "actualizadoEn")
SELECT 'cat_' || v.slug, v.nombre, v.slug, d."id", v.destacada, v.orden, v.meta_titulo, v.meta_descripcion, CURRENT_TIMESTAMP
FROM (VALUES
  ('Procesadores', 'procesadores', true, 1,
   'Procesadores Intel y AMD',
   'Compra procesadores Intel Core y AMD Ryzen para tu PC. Compara sockets, generaciones y precios.'),
  ('Placas madre', 'placas-madre', true, 2,
   'Placas madre para Intel y AMD',
   'Placas madre compatibles con Intel y AMD. Elige por socket, chipset y tamaño.'),
  ('Memorias RAM', 'memorias-ram', true, 3,
   'Memorias RAM DDR5 y DDR4',
   'Memorias RAM DDR5, DDR4 y para laptop. Elige por capacidad y velocidad.'),
  ('Tarjetas de video', 'tarjetas-de-video', true, 4,
   'Tarjetas de video NVIDIA, AMD e Intel',
   'Tarjetas de video NVIDIA GeForce, AMD Radeon e Intel Arc para gaming y diseño.'),
  ('Almacenamiento interno', 'almacenamiento-interno', false, 5,
   'Almacenamiento interno: SSD y discos duros',
   'SSD M.2 NVMe, SSD SATA y discos duros para instalar dentro de tu PC.'),
  ('Fuentes de poder', 'fuentes-de-poder', false, 6,
   'Fuentes de poder para PC',
   'Fuentes de poder con certificación 80 Plus. Elige por potencia y modularidad.'),
  ('Cases', 'cases', false, 7,
   'Cases para PC',
   'Cases torre mediana, torre completa y compactos para armar tu computadora.'),
  ('Refrigeración', 'refrigeracion', false, 8,
   'Refrigeración para PC',
   'Enfriamiento por aire y líquido, ventiladores y pasta térmica para mantener tu PC fría.'),
  ('Tarjetas de expansión', 'tarjetas-de-expansion', false, 9,
   'Tarjetas de expansión',
   'Tarjetas de sonido, red y WiFi, y capturadoras para ampliar tu PC.')
) AS v(nombre, slug, destacada, orden, meta_titulo, meta_descripcion)
CROSS JOIN "Categoria" d
WHERE d."slug" = 'componentes'
ON CONFLICT ("slug") DO UPDATE SET
  "nombre" = EXCLUDED."nombre",
  "padreId" = EXCLUDED."padreId",
  "destacada" = EXCLUDED."destacada",
  "orden" = EXCLUDED."orden",
  "metaTitulo" = EXCLUDED."metaTitulo",
  "metaDescripcion" = EXCLUDED."metaDescripcion",
  "actualizadoEn" = CURRENT_TIMESTAMP;

-- 3. Subcategorias (nivel 3, hijas de cada categoria). El slug lleva el nombre del
-- padre porque "Intel" o "DDR5" solos chocarian entre ramas (slug es unico global).
INSERT INTO "Categoria" ("id", "nombre", "slug", "padreId", "orden", "actualizadoEn")
SELECT 'cat_' || v.slug, v.nombre, v.slug, p."id", v.orden, CURRENT_TIMESTAMP
FROM (VALUES
  ('procesadores', 'Intel', 'procesadores-intel', 1),
  ('procesadores', 'AMD', 'procesadores-amd', 2),
  ('placas-madre', 'Para Intel', 'placas-madre-intel', 1),
  ('placas-madre', 'Para AMD', 'placas-madre-amd', 2),
  ('memorias-ram', 'DDR5', 'memorias-ram-ddr5', 1),
  ('memorias-ram', 'DDR4', 'memorias-ram-ddr4', 2),
  ('memorias-ram', 'Para laptop', 'memorias-ram-laptop', 3),
  ('tarjetas-de-video', 'NVIDIA GeForce', 'tarjetas-de-video-nvidia-geforce', 1),
  ('tarjetas-de-video', 'AMD Radeon', 'tarjetas-de-video-amd-radeon', 2),
  ('tarjetas-de-video', 'Intel Arc', 'tarjetas-de-video-intel-arc', 3),
  ('tarjetas-de-video', 'Profesionales', 'tarjetas-de-video-profesionales', 4),
  ('almacenamiento-interno', 'SSD M.2 NVMe', 'almacenamiento-ssd-m2-nvme', 1),
  ('almacenamiento-interno', 'SSD SATA 2.5"', 'almacenamiento-ssd-sata', 2),
  ('almacenamiento-interno', 'Discos duros', 'almacenamiento-discos-duros', 3),
  ('cases', 'Torre mediana', 'cases-torre-mediana', 1),
  ('cases', 'Torre completa', 'cases-torre-completa', 2),
  ('cases', 'Compactos', 'cases-compactos', 3),
  ('refrigeracion', 'Enfriamiento por aire', 'refrigeracion-aire', 1),
  ('refrigeracion', 'Enfriamiento líquido', 'refrigeracion-liquida', 2),
  ('refrigeracion', 'Ventiladores', 'refrigeracion-ventiladores', 3),
  ('refrigeracion', 'Pasta y pads térmicos', 'refrigeracion-pasta-termica', 4),
  ('tarjetas-de-expansion', 'Sonido', 'expansion-sonido', 1),
  ('tarjetas-de-expansion', 'Red y WiFi', 'expansion-red-wifi', 2),
  ('tarjetas-de-expansion', 'Capturadoras', 'expansion-capturadoras', 3)
) AS v(padre_slug, nombre, slug, orden)
JOIN "Categoria" p ON p."slug" = v.padre_slug
ON CONFLICT ("slug") DO UPDATE SET
  "nombre" = EXCLUDED."nombre",
  "padreId" = EXCLUDED."padreId",
  "orden" = EXCLUDED."orden",
  "actualizadoEn" = CURRENT_TIMESTAMP;
