# @webstore/MODULO

> Copia esta carpeta a `packages/modules/<modulo>/`, reemplaza `MODULO` y sigue el checklist de `ARCHITECTURE.md` §6.

## Qué hace
Descripción en una o dos frases.

## Tablas que posee
| Tabla | Descripción | RLS |
|---|---|---|
| `ejemplo` | ... | lectura pública / escritura solo admin |

## API pública (`src/index.ts`)
- Tipos: ...
- Acciones: ...
- Hooks: ...
- UI: ...

## Depende de
- `@webstore/db`
- (otros módulos de nivel inferior, si aplica)

## Carpetas
| Carpeta | Contenido |
|---|---|
| `src/domain/` | entidades y reglas puras, sin Supabase ni React |
| `src/schemas/` | validación Zod de toda entrada externa |
| `src/data/` | queries a Supabase (único lugar con acceso a datos) |
| `src/actions/` | Server Actions / casos de uso |
| `src/hooks/` | hooks de React |
| `src/ui/` | componentes del dominio |
| `tests/` | pruebas del módulo |
