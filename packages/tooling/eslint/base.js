// Configuración ESLint compartida por todo el monorepo.
// Aquí viven las reglas que IMPONEN la arquitectura (ver ARCHITECTURE.md):
// nadie importa el interior de otro paquete, solo su puerta de entrada (index).
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export const ignores = {
  ignores: ["**/.next/**", "**/dist/**", "**/node_modules/**", "**/.turbo/**", "**/next-env.d.ts"],
};

/** Reglas de arquitectura: se usan en paquetes y en apps. */
export const architectureRules = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@webstore/*/src", "@webstore/*/src/**"],
            message: "Importa solo desde la puerta de entrada del paquete (ej. '@webstore/catalog'), nunca su interior.",
          },
          {
            group: ["**/packages/**"],
            message: "Usa el nombre del paquete (@webstore/...), no rutas relativas entre paquetes.",
          },
        ],
      },
    ],
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};

/** Config completa para paquetes (packages/core/*, packages/modules/*). */
export default tseslint.config(ignores, js.configs.recommended, ...tseslint.configs.recommended, architectureRules, {
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",
  },
});
