-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "destacado" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");

-- CreateIndex
CREATE INDEX "Producto_marcaId_idx" ON "Producto"("marcaId");
