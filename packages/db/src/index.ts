import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generado/client";

const global_ = globalThis as unknown as { prisma?: PrismaClient };

function crear() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db = global_.prisma ?? crear();
if (process.env.NODE_ENV !== "production") global_.prisma = db;

export * from "./generado/client";
