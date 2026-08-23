-- Cupones de descuento para el checkout (bloque Marketing del panel).

-- CreateEnum
CREATE TYPE "TipoCupon" AS ENUM ('PORCENTAJE', 'MONTO_FIJO');

-- CreateTable
CREATE TABLE "cupones" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoCupon" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "montoMinimo" DECIMAL(10,2),
    "usoMaximo" INTEGER,
    "usosActuales" INTEGER NOT NULL DEFAULT 0,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cupones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cupones_codigo_key" ON "cupones"("codigo");

-- Un pedido puede haber usado un cupón; RESTRICT para no perder el registro
-- de qué descuento se aplicó en un pedido ya hecho.
ALTER TABLE "pedidos" ADD COLUMN "cuponId" TEXT;
ALTER TABLE "pedidos" ADD COLUMN "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cuponId_fkey" FOREIGN KEY ("cuponId") REFERENCES "cupones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Permisos nuevos para el rol ADMIN (mismo patrón que el resto: se otorgan
-- todos los permisos existentes al rol ADMIN en prisma/seed.js).
INSERT INTO "permisos" ("id", "clave") VALUES
  (gen_random_uuid()::text, 'cupones.crear'),
  (gen_random_uuid()::text, 'cupones.editar'),
  (gen_random_uuid()::text, 'cupones.eliminar')
ON CONFLICT ("clave") DO NOTHING;
