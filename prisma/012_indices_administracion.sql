-- Índices para las consultas más frecuentes del panel administrativo.
-- IF NOT EXISTS permite aplicar este archivo de forma segura en entornos
-- donde alguno de los índices ya haya sido creado manualmente.

CREATE INDEX IF NOT EXISTS "pedidos_usuarioId_idx" ON "pedidos"("usuarioId");
CREATE INDEX IF NOT EXISTS "pedidos_estado_creadoEn_idx" ON "pedidos"("estado", "creadoEn");
CREATE INDEX IF NOT EXISTS "pedidos_cuponId_idx" ON "pedidos"("cuponId");
CREATE INDEX IF NOT EXISTS "items_pedido_pedidoId_idx" ON "items_pedido"("pedidoId");
CREATE INDEX IF NOT EXISTS "items_pedido_varianteId_idx" ON "items_pedido"("varianteId");
CREATE INDEX IF NOT EXISTS "cupones_activo_fechaFin_idx" ON "cupones"("activo", "fechaFin");
