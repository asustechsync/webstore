// Genera estilos/tokens.css a partir de tokens.ts. Uso: npm run tokens -w @webstore/ui
import { writeFileSync } from "node:fs";
import { tokens } from "./tokens.ts";

const lineas = [];
for (const [grupo, valores] of Object.entries(tokens)) {
  for (const [clave, valor] of Object.entries(valores)) {
    const nombre = clave.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    lineas.push(`  --${grupo}-${nombre}: ${valor};`);
  }
}
const css = `/* Generado desde tokens.ts. No editar a mano: npm run tokens -w @webstore/ui */\n:root {\n${lineas.join("\n")}\n}\n`;
writeFileSync(new URL("./estilos/tokens.css", import.meta.url), css);
