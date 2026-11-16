# ADR 0001: Monorepo modular por dominios

- **Estado:** aceptado
- **Fecha:** 2026-11-16

## Contexto
El proyecto anterior (`appweb`) creció agregando tablas y funciones sin estructura, hasta volverse difícil de entender y mantener. Necesitamos web, admin y mobile, y poder crecer agregando funcionalidades sin reorganizar.

## Decisión
- Monorepo con pnpm workspaces + Turborepo.
- Capas con dependencias solo hacia abajo: `apps → modules → core → tooling`.
- La lógica de negocio vive en **módulos por dominio** (`packages/modules/*`), todos con la misma anatomía y una sola puerta de entrada (`index.ts`).
- Cada tabla pertenece a un solo módulo.
- Design system compartido (`core/ui`, `core/tokens`) con componentes propios en cada app. Un componente sube a `packages/` cuando una segunda app lo necesita.
- Las reglas se imponen con ESLint, no solo con documentación.

## Consecuencias
- Agregar una funcionalidad equivale a agregar o ampliar una carpeta, sin reestructurar.
- Admin y mobile reutilizan toda la lógica ya construida para web.
- Requiere disciplina inicial de configuración (tooling), que ya queda resuelta en el esqueleto.
