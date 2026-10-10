-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('DNI', 'RUC', 'CE', 'PASAPORTE');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tipoDocumento" "TipoDocumento",
ADD COLUMN     "numeroDocumento" TEXT,
ADD COLUMN     "razonSocial" TEXT,
ADD COLUMN     "correoVerificadoEn" TIMESTAMP(3),
ADD COLUMN     "ultimoAccesoEn" TIMESTAMP(3);
