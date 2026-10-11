-- CreateEnum
CREATE TYPE "AmbitoAtributo" AS ENUM ('PRODUCTO', 'VARIANTE');

-- AlterTable
ALTER TABLE "Atributo" ADD COLUMN     "ambito" "AmbitoAtributo" NOT NULL DEFAULT 'PRODUCTO';

-- CreateTable
CREATE TABLE "ProductoAtributoValor" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "atributoId" TEXT NOT NULL,
    "valorTexto" TEXT,
    "valorNumero" DOUBLE PRECISION,
    "valorBooleano" BOOLEAN,

    CONSTRAINT "ProductoAtributoValor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarianteAtributoValor" (
    "id" TEXT NOT NULL,
    "varianteId" TEXT NOT NULL,
    "atributoId" TEXT NOT NULL,
    "valorTexto" TEXT,
    "valorNumero" DOUBLE PRECISION,
    "valorBooleano" BOOLEAN,

    CONSTRAINT "VarianteAtributoValor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductoAtributoValor_atributoId_valorTexto_idx" ON "ProductoAtributoValor"("atributoId", "valorTexto");

-- CreateIndex
CREATE INDEX "ProductoAtributoValor_atributoId_valorNumero_idx" ON "ProductoAtributoValor"("atributoId", "valorNumero");

-- CreateIndex
CREATE UNIQUE INDEX "ProductoAtributoValor_productoId_atributoId_key" ON "ProductoAtributoValor"("productoId", "atributoId");

-- CreateIndex
CREATE INDEX "VarianteAtributoValor_atributoId_valorTexto_idx" ON "VarianteAtributoValor"("atributoId", "valorTexto");

-- CreateIndex
CREATE INDEX "VarianteAtributoValor_atributoId_valorNumero_idx" ON "VarianteAtributoValor"("atributoId", "valorNumero");

-- CreateIndex
CREATE UNIQUE INDEX "VarianteAtributoValor_varianteId_atributoId_key" ON "VarianteAtributoValor"("varianteId", "atributoId");

-- AddForeignKey
ALTER TABLE "ProductoAtributoValor" ADD CONSTRAINT "ProductoAtributoValor_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoAtributoValor" ADD CONSTRAINT "ProductoAtributoValor_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarianteAtributoValor" ADD CONSTRAINT "VarianteAtributoValor_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "Variante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarianteAtributoValor" ADD CONSTRAINT "VarianteAtributoValor_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

