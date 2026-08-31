import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Supabase usa una CA privada para PostgreSQL. Confiamos únicamente en su CA
// pública y mantenemos la validación del certificado activa en todo entorno.
const supabaseCa = readFileSync(
  join(process.cwd(), "certs", "supabase-ca-2021.crt"),
  "utf8",
);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: supabaseCa,
    rejectUnauthorized: true,
  },
});

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
