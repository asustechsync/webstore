-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "metaDescripcion" TEXT,
ADD COLUMN     "metaTitulo" TEXT;
