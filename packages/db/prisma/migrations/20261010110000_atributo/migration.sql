-- CreateEnum
CREATE TYPE "TipoAtributo" AS ENUM ('LISTA', 'NUMERO', 'SI_NO');

-- CreateTable
CREATE TABLE "Atributo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "tipo" "TipoAtributo" NOT NULL,
    "unidad" TEXT,
    "opciones" TEXT[],
    "categoriaId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Atributo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Atributo_categoriaId_idx" ON "Atributo"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Atributo_categoriaId_clave_key" ON "Atributo"("categoriaId", "clave");

-- AddForeignKey
ALTER TABLE "Atributo" ADD CONSTRAINT "Atributo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

