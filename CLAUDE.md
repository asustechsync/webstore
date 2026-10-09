# Reglas del proyecto

Ecommerce de tecnologia: componentes y PCs. Monorepo npm + Turborepo.

- `apps/web` tienda publica y `/mi-cuenta` (puerto 3000)
- `apps/admin` panel de administracion (puerto 3001)
- `packages/core` logica de negocio · `packages/db` Prisma · `packages/ui` tokens y primitivos

## Reglas duras

1. El layout raiz de `apps/web` no lee cookies. La sesion entra por una isla cliente.
2. El catalogo publico se lee de funciones cacheadas (`use cache` + `cacheTag`), nunca con joins en vivo.
3. Toda invalidacion de cache pasa por un unico archivo de etiquetas (`apps/web/src/lib/cache.ts`).
4. La logica de negocio va en `packages/core`, nunca en paginas ni componentes.
5. El stock no se toca sin escribir en `MovimientoStock`. Nunca un UPDATE de stock.
6. Ninguna pagina define estilos: todo sale de `packages/ui` (tokens y primitivos).
7. Precio y direccion se congelan en el pedido.
8. Precios siempre en centimos (enteros).

## Base de datos

- `schema.prisma` se mantiene a mano. No usar `prisma db pull`.
- SQL que Prisma no expresa va en `packages/db/prisma/sql/`, idempotente.
- Prisma 7: el cliente se genera en `packages/db/src/generado` (ignorado en git).

## Convenciones

- Codigo, comentarios, nombres y commits en español.
- FIRST MOBILE: estilos base de movil; los quiebres solo añaden.

## Integraciones aplazadas (interfaces ya existen en `packages/core/src/puertos/`)

- `pasarela-pago.ts` · `facturacion.ts` (SUNAT) · `notificaciones.ts`
