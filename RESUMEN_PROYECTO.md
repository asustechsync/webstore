# Resumen del proyecto Webstore — para retomar en otra PC o sesión

Ecommerce privado para negocio propio de Leonardo. Repositorio:
https://github.com/asustechsync/webstore

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **CSS Modules** (NO Tailwind — se quitó a propósito porque al usuario se le
  dificultaba trabajar con clases de utilidad; todo el estilo va en
  `Componente.module.css` + variables centralizadas en `src/styles/tokens.css`)
- **Supabase**: Postgres + Auth (correo/contraseña + Google + Microsoft + Facebook)
- **Prisma 7** sobre Postgres de Supabase, con driver adapter (`@prisma/adapter-pg`)
- **Cloudinary**: alojamiento de imágenes (NO Supabase Storage — decisión explícita)
- **Zustand**: carrito en cliente (`src/store/cartStore.ts`, persistido en localStorage)
- **Zod**: validación de formularios/schemas

## Estructura de carpetas — árbol real y completo (hoy)

```
webstore/
├─ prisma/
│  ├─ schema.prisma                 → modelo completo de datos
│  ├─ seed.js                       → seed de roles/permisos (JS plano, NO .ts — ver nota abajo)
│  ├─ init.sql                      → schema completo, para pegar en Supabase SQL Editor
│  ├─ 002_carrito.sql               → migración incremental (carrito), ya integrada en init.sql
│  ├─ hook_rol_en_token.sql         → hook: mete el rol del usuario dentro del JWT
│  └─ trigger_crear_usuario.sql     → trigger: auto-crea la fila en `usuarios` al registrarse
│  (NO existe carpeta migrations/ — no usamos `prisma migrate`, ver sección de BD abajo)
│  (NO existe carpeta supabase/ con config.toml — no se instaló Supabase CLI local, no hizo falta)
│
├─ src/
│  ├─ app/
│  │  ├─ (tienda)/
│  │  │  ├─ layout.tsx                      → Header + Footer del sitio público
│  │  │  ├─ page.tsx                        → home
│  │  │  ├─ productos/
│  │  │  │  ├─ page.tsx                     → catálogo (ISR, revalidate 300s)
│  │  │  │  ├─ page.module.css
│  │  │  │  └─ [slug]/page.tsx              → ficha de producto
│  │  │  ├─ categorias/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [slug]/page.tsx
│  │  │  ├─ marcas/[slug]/page.tsx
│  │  │  ├─ carrito/
│  │  │  │  ├─ page.tsx                     → "use client", lee useCartStore
│  │  │  │  └─ page.module.css
│  │  │  ├─ checkout/page.tsx               → placeholder, fase 3 (Izipay)
│  │  │  └─ pedido/[id]/page.tsx
│  │  │
│  │  ├─ (auth)/
│  │  │  ├─ ingresar/
│  │  │  │  ├─ page.tsx                     → incluye <BotonesOAuth />
│  │  │  │  └─ IngresarForm.tsx             → "use client", email/password + redirect por rol
│  │  │  └─ registro/
│  │  │     ├─ page.tsx                     → incluye <BotonesOAuth />
│  │  │     ├─ RegistroForm.tsx
│  │  │     └─ RegistroForm.module.css      → estilos compartidos con IngresarForm también
│  │  │
│  │  ├─ cuenta/                            # área privada del cliente
│  │  │  ├─ layout.tsx                      → guard de sesión + Header/Footer
│  │  │  ├─ page.tsx                        → saluda, muestra rol, botón cerrar sesión
│  │  │  ├─ CerrarSesionBoton.tsx
│  │  │  ├─ pedidos/page.tsx
│  │  │  ├─ direcciones/page.tsx
│  │  │  └─ perfil/page.tsx
│  │  │
│  │  ├─ admin/                             # panel administrativo
│  │  │  ├─ layout.tsx                      → guard de rol ADMIN
│  │  │  ├─ page.tsx                        → dashboard (placeholder)
│  │  │  ├─ productos/
│  │  │  │  ├─ page.tsx                     → listado real desde Prisma
│  │  │  │  ├─ page.module.css
│  │  │  │  ├─ nuevo/page.tsx               → placeholder, falta el formulario real
│  │  │  │  └─ [id]/page.tsx                → placeholder, falta el formulario real
│  │  │  ├─ categorias/page.tsx             → placeholder — SIGUIENTE A CONSTRUIR
│  │  │  ├─ marcas/page.tsx                 → placeholder — SIGUIENTE A CONSTRUIR
│  │  │  ├─ stock/page.tsx                  → placeholder, fase 2
│  │  │  ├─ usuarios/
│  │  │  │  ├─ page.tsx                     → listado real desde Prisma
│  │  │  │  └─ page.module.css
│  │  │  ├─ pedidos/page.tsx                → placeholder
│  │  │  ├─ facturacion/page.tsx            → placeholder, fase 3
│  │  │  └─ envios/page.tsx                 → placeholder, fase 3
│  │  │
│  │  ├─ api/
│  │  │  ├─ webhooks/
│  │  │  │  ├─ izipay/route.ts              → placeholder, fase 3
│  │  │  │  └─ shalom/route.ts              → placeholder, fase 3
│  │  │  └─ auth/callback/route.ts          → callback de Supabase (OAuth + email)
│  │  │
│  │  ├─ layout.tsx                         → root layout (fuentes Geist, sin Header/Footer)
│  │  └─ globals.css                        → importa tokens.css, reset básico
│  │
│  ├─ features/                             # lógica de negocio por dominio
│  │  ├─ catalogo/
│  │  │  ├─ actions.ts                      → crearProducto/actualizarProducto/eliminarProducto
│  │  │  ├─ queries.ts                      → listarProductos, obtenerProductoPorSlug
│  │  │  ├─ schemas.ts                      → Zod
│  │  │  └─ types.ts
│  │  └─ usuarios/
│  │     └─ schemas.ts                      → registroSchema, loginSchema
│  │  (categorias/, marcas/, carrito/, checkout/, pedidos/, stock/, facturacion/,
│  │   envios/ → carpetas planeadas, TODAVÍA NO creadas/tienen archivos)
│  │
│  ├─ integrations/
│  │  ├─ cloudinary/client.ts               → subirImagen, eliminarImagen (funcional)
│  │  ├─ izipay/client.ts                   → placeholder, lanza error "fase 3"
│  │  └─ shalom/client.ts                   → placeholder, lanza error "fase 3"
│  │
│  ├─ components/
│  │  ├─ ui/                                → Button, Input, Container (+ .module.css c/u)
│  │  ├─ layout/                            → Header (async, lee sesión), Footer
│  │  └─ shared/                            → BotonesOAuth (Google/Microsoft/Facebook)
│  │
│  ├─ lib/
│  │  ├─ supabase/
│  │  │  ├─ client.ts                       → cliente browser
│  │  │  ├─ server.ts                       → cliente server (cookies)
│  │  │  └─ admin.ts                        → service role, solo server
│  │  ├─ db.ts                              → Prisma + adapter-pg + ssl rejectUnauthorized:false
│  │  ├─ auth.ts                            → getUsuarioActual (cache de React), requirePermiso
│  │  ├─ jwt.ts                             → decodificarClaims (lee el rol del JWT sin red)
│  │  └─ utils.ts                           → formatearPrecio, slugificar
│  │  (NO existe carpeta hooks/ ni types/ todavía — no hizo falta aún)
│  │
│  ├─ store/
│  │  └─ cartStore.ts                       → Zustand + persist (localStorage)
│  │
│  ├─ styles/
│  │  └─ tokens.css                         → TODAS las variables de diseño (colores, sombras,
│  │                                            radios, espaciados, tipografía)
│  │
│  └─ proxy.ts                              → (antes middleware.ts — Next.js 16 lo renombró;
│                                                la función exportada también se llama `proxy`,
│                                                no `middleware`) protege /admin y /cuenta,
│                                                usa getClaims() (verifica JWT sin llamar a Supabase)
│
├─ .env.local          → credenciales reales (gitignored)
├─ .env.example        → plantilla (sí en git)
├─ prisma.config.ts    → URL de conexión para el CLI de Prisma (Prisma 7 ya no la acepta en schema.prisma)
├─ next.config.ts      → remotePatterns habilitado para imágenes de Cloudinary
├─ package.json
└─ RESUMEN_PROYECTO.md → este archivo
```

`prisma/schema.prisma` tiene: Usuario, Rol, Permiso, RolPermiso (roles/permisos
relacionales, no un campo string — decisión para poder agregar ALMACEN, VENTAS,
DESPACHO después sin tocar código), Direccion, Marca, Categoria, Producto,
ImagenProducto, Stock, Carrito, ItemCarrito, Pedido, ItemPedido.

**Diferencias respecto a la propuesta original que se aprobó al inicio** (para que no
generen confusión si comparas con mensajes viejos del chat):
- `middleware.ts` → se renombró a `src/proxy.ts` (cambio de convención de Next.js 16, no nuestro)
- No hay `prisma/migrations/` ni `supabase/config.toml` — se decidió no usar esas
  herramientas por el problema de conexión local (ver sección de BD)
- `src/hooks/` y `src/types/` aún no existen — se crean cuando haga falta, no antes
- `features/usuarios/actions.ts` se creó y **luego se eliminó** — la lógica que tenía
  (sincronizar usuario nuevo) la reemplazó el trigger de Postgres, quedó redundante

## Autenticación — completa y funcionando

- Registro/login con correo y contraseña
- Login social: **Google, Microsoft (Azure), Facebook** — todos configurados y probados
- Todos usan la misma URL de callback de Supabase:
  `https://lerparjiuyclzzkmbhtb.supabase.co/auth/v1/callback`
- Auto-vinculación por correo: si el mismo email se usa con distinto proveedor, es la misma cuenta
- Redirección post-login por rol (ADMIN → `/admin`, CLIENTE → `/cuenta`) — el rol viaja
  **dentro del JWT** (hook `custom_access_token_hook`, ver `prisma/hook_rol_en_token.sql`),
  sin consulta extra a la base de datos
- La fila en `usuarios` se crea automáticamente vía **trigger de Postgres**
  (`prisma/trigger_crear_usuario.sql`, función `handle_new_user()` sobre `auth.users`) —
  la app no hace ninguna llamada extra para sincronizar usuarios nuevos
- Cuenta admin actual: `asustechsync@gmail.com` (rol ADMIN)

## Base de datos — cómo se administra

**Importante**: el CLI de Prisma (`prisma migrate dev`, `db push`) se cuelga en esta PC
por interferencia de un antivirus/firewall con el certificado SSL de Supabase. Por eso
las tablas se crean con **SQL generado manualmente y pegado en el SQL Editor de Supabase**,
no con `prisma migrate`. Los archivos SQL ya aplicados están en `prisma/`:
- `init.sql` — schema completo inicial
- `002_carrito.sql` — tablas de carrito (ya integradas en init.sql también)
- `hook_rol_en_token.sql` — rol en el JWT
- `trigger_crear_usuario.sql` — auto-creación de usuarios

Si se necesita otra migración a futuro: cambiar `prisma/schema.prisma`, correr
`npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`
para generar el SQL, y pegarlo a mano en Supabase.

**Para queries/escritura desde la app sí funciona bien** (Prisma Client normal), el
problema es específico del CLI de migraciones. Configuración necesaria en cualquier
cliente Prisma nuevo: `ssl: { rejectUnauthorized: false }` en `PrismaPg` (ver `src/lib/db.ts`)
por el mismo tema del certificado interceptado.

El seed de roles/permisos (`prisma/seed.js`, ejecutar con `node prisma/seed.js` — **NO**
con `tsx`, tsx también tiene problemas de conexión aquí) crea los permisos base y los
roles ADMIN/CLIENTE.

## Variables de entorno necesarias (`.env.local`, nunca se sube a git)

```
DATABASE_URL              → Postgres de Supabase (pooler, puerto 6543, con ?pgbouncer=true)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
IZIPAY_*                  → vacíos, fase 3
SHALOM_API_KEY             → vacío, fase 3
```

Plantilla sin valores en `.env.example` (sí está en git).

Google/Microsoft/Facebook: sus Client ID/Secret están configurados directamente en el
dashboard de Supabase (Authentication → Providers), no en `.env.local`.

## Estado del proyecto — roadmap

**Fase 1 (en curso)**:
1. ✅ Estructura del proyecto
2. ✅ Supabase + Cloudinary conectados
3. ✅ Autenticación completa (correo + 3 proveedores OAuth, roles, optimizada)
4. ⬜ CRUD de Categorías (admin) — **siguiente paso**
5. ⬜ CRUD de Marcas (admin)
6. ⬜ CRUD de Productos (admin, con subida de imágenes a Cloudinary)
7. ⬜ Catálogo público con datos reales

**Fase 2**: Stock/inventario (modelo ya está en el schema, falta UI y lógica de descuento)

**Fase 3**: Pagos (Izipay), facturación, rastreo de envíos (Shalom) — placeholders creados
en `src/integrations/`, sin implementar todavía

## Decisiones de diseño importantes (para no repetir la discusión)

- **CSS Modules, no Tailwind** — preferencia explícita del usuario
- Todo color/sombra/radio/espaciado sale de `src/styles/tokens.css` — nunca hardcodeado
- Diseño visual (paleta de marca) **todavía sin definir** — falta que el usuario dé
  referencias de color/estilo antes de diseñar en serio
- `Container` component (`src/components/ui/Container.tsx`) para el layout de ancho máximo
- 500 productos aprox. esperados — no se necesita arquitectura de microservicios
