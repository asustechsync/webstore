-- Renombrar conserva los datos existentes
ALTER TABLE "Usuario" RENAME COLUMN "nombre" TO "nombres";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "apellidos" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fechaNacimiento" DATE;
