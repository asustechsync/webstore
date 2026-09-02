-- Checkout: el pedido pasa a guardar cómo se paga y a dónde se envía.
--
-- Los datos de envío se copian del formulario en vez de apuntar a
-- "direcciones": un pedido es un documento histórico y no debe cambiar si
-- después el cliente edita o borra esa dirección.

CREATE TYPE "MetodoPago" AS ENUM ('TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA');

ALTER TABLE "pedidos"
  ADD COLUMN "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "costoEnvio" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "metodoPago" "MetodoPago",
  ADD COLUMN "envioDestinatario" TEXT,
  ADD COLUMN "envioTelefono" TEXT,
  ADD COLUMN "envioDepartamento" TEXT,
  ADD COLUMN "envioProvincia" TEXT,
  ADD COLUMN "envioDistrito" TEXT,
  ADD COLUMN "envioDireccion" TEXT,
  ADD COLUMN "envioReferencia" TEXT,
  ADD COLUMN "envioCodigoPostal" TEXT;

-- Los pedidos anteriores no tenían desglose: su subtotal es el total más el
-- descuento que se les aplicó, y no llevaban costo de envío.
UPDATE "pedidos" SET "subtotal" = "total" + "descuento" WHERE "subtotal" = 0;
