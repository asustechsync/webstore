import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// El .env vive en la raiz del monorepo.
config({ path: "../../.env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Las migraciones usan la conexion directa (5432); la app usa DATABASE_URL (pooler).
  datasource: { url: env("DIRECT_URL") },
});
