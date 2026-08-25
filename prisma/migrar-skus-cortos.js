require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const variantes = await db.variante.findMany({ select: { id: true, sku: true } });
  const cambios = variantes
    .map(({ id, sku }) => ({ id, anterior: sku, nuevo: sku.replace(/^([^-]+)-([^-]+)-/, "$1$2-") }))
    .filter(({ anterior, nuevo }) => anterior !== nuevo);

  const nuevos = new Set();
  for (const cambio of cambios) {
    if (nuevos.has(cambio.nuevo)) throw new Error(`SKU duplicado en la migración: ${cambio.nuevo}`);
    nuevos.add(cambio.nuevo);
  }
  const idsQueCambian = new Set(cambios.map(({ id }) => id));
  const existentes = new Set(variantes.filter(({ id }) => !idsQueCambian.has(id)).map(({ sku }) => sku));
  for (const cambio of cambios) {
    if (existentes.has(cambio.nuevo)) throw new Error(`El SKU nuevo ya existe: ${cambio.nuevo}`);
  }

  await db.$transaction(async (tx) => {
    for (const cambio of cambios) {
      await tx.variante.update({ where: { id: cambio.id }, data: { sku: `__migrando__${cambio.id}` } });
    }
    for (const cambio of cambios) {
      await tx.variante.update({ where: { id: cambio.id }, data: { sku: cambio.nuevo } });
    }
  });

  console.log(`SKU migrados: ${cambios.length}`);
  for (const cambio of cambios) console.log(`${cambio.anterior} -> ${cambio.nuevo}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
