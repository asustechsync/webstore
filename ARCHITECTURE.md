# Arquitectura de webstore

> **Fuente de verdad del proyecto.** Antes de crear cualquier archivo, módulo o app,
> lee este documento y respeta su estructura y reglas. Si una decisión cambia la
> arquitectura, primero se actualiza este archivo y se registra un ADR en `docs/adr/`.

## 1. Qué es este producto

- Un **ecommerce modular** con tres apps: **web** (tienda), **admin** (panel del negocio) y **mobile** (app del cliente).
- Se vende a **cada negocio por separado**: **una instalación independiente por cliente**
  (su propio proyecto de Vercel y su propia base de Supabase). **No es SaaS multi-tenant.**
- **Un solo código para todos los clientes.** Cada cliente se diferencia solo por su
  configuración (`clients/<cliente>/client.config.ts`). **Nunca se copia el código por cliente.**
- Objetivo de escala: 10 mil → 100 mil usuarios por instalación.

## 2. Stack

| Capa | Tecnología |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Web y admin | Next.js (App Router) + React + TypeScript estricto |
| Mobile | Expo (React Native) |
| Estilos | Tailwind CSS v4 + design tokens (`@webstore/tokens`) |
| Base de datos, auth, storage | Supabase (Postgres + RLS) |
| Validación | Zod |
| Hosting | Vercel (una instalación por cliente) |
| Calidad | ESLint (con reglas de arquitectura), tests, Playwright (e2e), GitHub Actions |

## 3. Estructura final (objetivo)

Las etiquetas indican en qué fase se crea cada parte. **Estado actual: fase 1, paso 1 (esqueleto) y portada visual (ADR 0003) completados.**

```
webstore/
├── apps/                                   1 · APLICACIONES (lo que ve cada usuario)
│   ├── web/                                tienda del cliente · Next.js            [fase 1] ✅ creada
│   │   ├── src/app/                        rutas: (shop), (account), api/
│   │   ├── src/components/                 componentes SOLO de esta app
│   │   ├── src/env.ts                      variables validadas con Zod             [seguridad]
│   │   ├── src/proxy.ts                    sesión y rutas protegidas (con auth)    [seguridad]
│   │   └── next.config.ts                  CSP y security headers                  [seguridad]
│   ├── admin/                              panel del negocio · Next.js · 2FA+roles [fase 2]
│   └── mobile/                             app del cliente · Expo · SecureStore    [fase 3]
│
├── packages/
│   ├── modules/                            2 · MÓDULOS DE NEGOCIO (uno por dominio)
│   │   ├── catalog/                        productos, categorías                   [fase 1]
│   │   ├── auth/                           registro, login, perfil                 [fase 1]
│   │   ├── cart/                           carrito persistente                     [fase 1]
│   │   ├── orders/                         pedidos y checkout                      [fase 1]
│   │   ├── payments/                       pasarela + webhooks (nunca guarda tarjetas) [fase 1]
│   │   ├── inventory/                      stock y variantes                       [fase 2]
│   │   ├── notifications/                  correos y push                          [fase 2]
│   │   ├── coupons/ reviews/ shipping/ analytics/                                  [fase 3]
│   │
│   ├── core/                               3 · NÚCLEO COMPARTIDO
│   │   ├── tokens/                         colores, tipografía, radios             ✅ creado
│   │   ├── ui/                             design system web (Button, Input, Card) ✅ creado
│   │   ├── db/                             clientes Supabase server/browser + tipos ✅ creado
│   │   ├── ui-native/                      design system mobile                    [fase 3]
│   │   ├── client-config/                  lee la config del cliente y activa módulos [al 2.º cliente]
│   │   ├── observability/                  errores y logs (Sentry)                 [fase 2]
│   │   ├── rate-limit/                     frena abuso y bots                      [fase 1, con auth]
│   │   ├── audit-log/                      quién cambió qué y cuándo               [fase 2]
│   │   └── utils/                          utilidades puras                        [cuando haga falta]
│   │
│   └── tooling/                            CALIDAD
│       ├── tsconfig/                       TypeScript estricto                     ✅ creado
│       └── eslint/                         reglas de arquitectura                  ✅ creado
│
├── clients/                                4 · CLIENTES (un negocio = una carpeta, sin código) [al 2.º cliente]
│   ├── _template/                          base para un cliente nuevo
│   └── <cliente>/                          client.config.ts + assets/
│
├── supabase/                               5 · BASE DE DATOS
│   ├── migrations/                         una migración por módulo, RLS en CADA tabla
│   ├── tests/                              pruebas de permisos RLS
│   ├── functions/                          webhooks con firma verificada, colas
│   └── seed.sql                            datos de prueba
│
├── scripts/                                6 · OPERACIÓN: new-client, migrate-all, deploy-client
├── e2e/                                    pruebas end-to-end (compra completa)    [fase 1, al final]
├── docs/
│   ├── adr/                                decisiones de arquitectura (por qué)
│   ├── templates/module/                   plantilla de anatomía de módulo
│   └── runbooks/ SECURITY.md               operación y seguridad                   [fase 2]
├── .github/                                CI, deploy por cliente, CODEOWNERS, Dependabot, CodeQL
├── ARCHITECTURE.md                         este archivo
├── CLAUDE.md                               instrucciones para el asistente
└── package.json · pnpm-workspace.yaml · turbo.json · .env.example
```

## 4. Anatomía de un módulo (igual en TODOS)

```
packages/modules/<modulo>/
├── src/
│   ├── domain/        entidades y reglas de negocio PURAS (sin Supabase, sin React)
│   ├── data/          acceso a Supabase (repositorio). Único lugar con queries.
│   ├── schemas/       validación Zod de toda entrada externa
│   ├── actions/       Server Actions / casos de uso (orquestan domain + data)
│   ├── hooks/         hooks de React para las apps
│   ├── ui/            componentes propios del dominio (ej. ProductCard)
│   └── index.ts       ÚNICA puerta de entrada pública
├── tests/
├── package.json       nombre: @webstore/<modulo>
├── tsconfig.json
├── eslint.config.js
└── README.md          qué hace, tablas que posee, qué exporta
```

La plantilla está en `docs/templates/module/`.

## 5. Reglas (obligatorias)

### Orden y dependencias
1. **Dependencias solo hacia abajo:** `apps → modules → core → tooling`. Nunca al revés.
2. **Entre módulos también hay jerarquía:** `orders` puede usar `catalog` y `auth`; `catalog` nunca usa `orders`.
   Orden base: `auth`, `catalog` → `cart` → `orders` → `payments`.
3. **Solo se importa la puerta de entrada:** `import { X } from "@webstore/catalog"`. Nunca `.../src/...`.
   ESLint lo bloquea (`packages/tooling/eslint/base.js`).
4. **Cada tabla tiene un solo dueño (un módulo).** Otro módulo que necesite esos datos los pide por la API pública del dueño.
5. **Un módulo a la vez:** no se empieza uno nuevo hasta cerrar el actual (checklist abajo).

### ¿Dónde va un componente?
- Lo usa **una sola app** → `apps/<app>/src/components/`.
- Lo usan **2+ apps y es de un dominio** → `packages/modules/<modulo>/src/ui/`.
- Lo usan **2+ apps y es genérico** (Button, Modal) → `packages/core/ui/` (mobile: `ui-native/`).
- **Todo nace en la app** y sube a `packages/` solo cuando una segunda app lo necesita.

### ¿Módulo nuevo o ampliar uno existente?
- Tiene **datos y reglas propias** (sus propias tablas) → módulo nuevo.
- Solo agrega algo a un dominio existente (ej. filtros de productos) → se amplía ese módulo.

### Seguridad
- **RLS activado en cada tabla**, con políticas probadas en `supabase/tests/`.
- **Toda entrada externa se valida con Zod** (`schemas/`) antes de tocar la base.
- **Secretos nunca en git.** Solo `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` jamás con prefijo `NEXT_PUBLIC_`
  y solo en código de servidor.
- Cliente Supabase de servidor (`@webstore/db/server`, marcado `server-only`) separado del de navegador.
- **Pagos:** la pasarela guarda las tarjetas; el estado del pedido solo cambia por **webhook con firma verificada**.
- Security headers y CSP en `next.config.ts` (pendiente: CSP con nonce al llegar auth/payments).
- Admin con **2FA y roles obligatorios**. Mobile guarda tokens en **SecureStore**.
- Rate limiting en login, registro y checkout. Audit log para acciones de admin.

### Rendimiento (escala 10k → 100k)
- Catálogo con páginas estáticas/ISR y caché; la mayoría de visitas no toca la base.
- Imágenes optimizadas y servidas por CDN.
- Índices en toda columna usada en filtros/joins; políticas RLS simples.
- Tareas lentas (correos, webhooks) fuera del request del usuario: colas / Edge Functions.

### Clientes (una instalación por negocio)
- Cada cliente = `clients/<cliente>/client.config.ts` (nombre, logo, colores, módulos activos) + `assets/`.
- Los **secretos de cada cliente** viven en su Vercel y su Supabase, nunca en el repo.
- Pedido especial de un cliente → se construye como **módulo** y se activa solo en su config. Nunca un fork.
- Versiones del producto en `CHANGELOG.md`; las migraciones se aplican a cada base con `scripts/migrate-all`.

## 6. Checklist para crear un módulo

1. Copiar `docs/templates/module/` a `packages/modules/<modulo>/` y renombrar a `@webstore/<modulo>`.
2. Migración en `supabase/migrations/` con sus tablas, índices y **RLS**.
3. Pruebas de permisos RLS en `supabase/tests/`.
4. Regenerar tipos en `packages/core/db/src/types.ts`.
5. `domain/` → `schemas/` → `data/` → `actions/` → `hooks/` → `ui/`.
6. Exportar solo lo público en `src/index.ts`.
7. Agregar el paquete a `transpilePackages` de la app y conectar sus pantallas.
8. Tests del módulo + `pnpm lint && pnpm typecheck && pnpm build` en verde.
9. Documentar en el `README.md` del módulo (tablas que posee y API pública).
10. Marcarlo como ✅ en la sección 3 y 7 de este archivo.

## 7. Hoja de ruta

### Fase 1: Tienda web (MVP: un cliente real puede comprar)
- [x] 1. Esqueleto: monorepo, tooling, `tokens`, `ui`, `db`, `apps/web`
- [x] 1b. Portada con el estilo marketplace (ADR 0003): tokens, header, footer y home con datos de ejemplo
- [ ] 2. `catalog`: productos y categorías (se cargan desde Supabase, sin admin todavía). Reemplaza `apps/web/src/lib/sample-products.ts`
- [ ] 3. `auth`: registro, login, perfil + `proxy.ts` + `rate-limit`
- [ ] 4. `cart`: carrito persistente
- [ ] 5. `orders` + `payments`: checkout, pasarela, webhooks
- [ ] 6. CI en GitHub Actions + e2e de la compra completa

### Fase 2: Operar el negocio
- [ ] `apps/admin` (2FA, roles), `inventory`, `notifications`, `observability`, `audit-log`, SEO y rendimiento

### Fase 3: Crecer
- [ ] `apps/mobile` + `ui-native`, `coupons`, `reviews`, `shipping`, `analytics`

### Al vender al 2.º cliente
- [ ] `clients/`, `core/client-config`, `scripts/new-client`, `scripts/migrate-all`, deploy por cliente

## 8. Comandos

```bash
pnpm install          # instalar dependencias
pnpm dev              # levantar todo en desarrollo (web en http://localhost:3000)
pnpm build            # compilar todo
pnpm lint             # revisar estilo y reglas de arquitectura
pnpm typecheck        # revisar tipos
```
