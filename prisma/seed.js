require("dotenv").config({ path: ".env.local" });
const { randomUUID } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

async function conReintento(fn, intentos = 5) {
  for (let intento = 1; intento <= intentos; intento++) {
    try {
      return await fn();
    } catch (error) {
      if (intento === intentos) throw error;
      console.log(`  reintentando (${intento}/${intentos})...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * intento));
    }
  }
}

const PERMISOS = [
  "productos.crear",
  "productos.editar",
  "productos.eliminar",
  "categorias.crear",
  "categorias.editar",
  "categorias.eliminar",
  "marcas.crear",
  "marcas.editar",
  "marcas.eliminar",
  "stock.editar",
  "usuarios.gestionar",
  "pedidos.ver",
  "pedidos.gestionar",
  "pedidos.despachar",
  "facturacion.emitir",
  "cupones.crear",
  "cupones.editar",
  "cupones.eliminar",
];

async function main() {
  for (const clave of PERMISOS) {
    await conReintento(() =>
      db.$executeRawUnsafe(
        `INSERT INTO permisos (id, clave) VALUES ($1, $2) ON CONFLICT (clave) DO NOTHING`,
        randomUUID(),
        clave,
      ),
    );
  }

  await conReintento(() =>
    db.$executeRawUnsafe(
      `INSERT INTO roles (id, nombre) VALUES ($1, 'ADMIN') ON CONFLICT (nombre) DO NOTHING`,
      randomUUID(),
    ),
  );
  await conReintento(() =>
    db.$executeRawUnsafe(
      `INSERT INTO roles (id, nombre) VALUES ($1, 'CLIENTE') ON CONFLICT (nombre) DO NOTHING`,
      randomUUID(),
    ),
  );

  const [rolAdmin] = await conReintento(() =>
    db.$queryRawUnsafe(`SELECT id FROM roles WHERE nombre = 'ADMIN'`),
  );
  const todosLosPermisos = await conReintento(() => db.$queryRawUnsafe(`SELECT id FROM permisos`));

  for (const permiso of todosLosPermisos) {
    await conReintento(() =>
      db.$executeRawUnsafe(
        `INSERT INTO roles_permisos ("rolId", "permisoId") VALUES ($1, $2) ON CONFLICT ("rolId", "permisoId") DO NOTHING`,
        rolAdmin.id,
        permiso.id,
      ),
    );
  }

  console.log("Seed de roles y permisos completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
