# Webstore

Tienda y panel administrativo construidos con Next.js, React, Prisma, PostgreSQL y Supabase Auth.

## Inicio rápido

```bash
npm install
npm run dev
```

Copia `.env.example` a `.env.local` y completa sus valores. Antes de entregar un cambio ejecuta:

```bash
npm run check
npm run build
```

`check` ejecuta lint, comprobación de tipos y pruebas sin levantar la aplicación.

## Dónde encontrar cada cosa

- `src/app`: rutas y composición de pantallas. Las páginas obtienen datos y entregan props serializables.
- `src/features/<dominio>/actions`: escrituras, permisos y transacciones del dominio.
- `src/features/<dominio>/queries`: lecturas reutilizables del dominio.
- `src/features/<dominio>/schemas`: validaciones Zod y tipos de entrada.
- `src/components/ui`: controles visuales genéricos.
- `src/components/admin`: patrones reutilizables exclusivos del panel administrativo.
- `src/integrations`: clientes de servicios externos.
- `src/lib`: infraestructura compartida, como base de datos, autenticación y resultados de acciones.
- `src/styles`: tokens y patrones visuales globales.
- `prisma`: modelo, migraciones SQL y datos iniciales.
- `tests`: pruebas rápidas de reglas puras y validaciones.

## Convención por dominio

Una funcionalidad nueva debe vivir en su dominio, no en un archivo general. Por ejemplo:

```text
src/features/catalogo/
├── actions/
│   ├── productos.ts
│   ├── categorias.ts
│   ├── marcas.ts
│   ├── atributos.ts
│   └── stock.ts
├── queries/
└── schemas/
```

Reglas prácticas:

1. Una página no contiene reglas de negocio; solo obtiene datos y compone componentes.
2. Toda entrada externa se valida con un schema del mismo dominio.
3. Toda escritura comprueba permisos dentro de la Server Action.
4. Si una interfaz aparece en dos CRUD del administrador, se mueve a `components/admin`.
5. Los valores visuales nuevos empiezan en `styles/tokens.css`; no se duplican colores o medidas.
6. No crear archivos generales que mezclen dominios sin relación.

## Base de datos

El modelo está en `prisma/schema.prisma`. Los cambios desplegables se conservan como SQL numerado en `prisma/`. Después de modificar el modelo, añade su migración SQL correspondiente y valida el cliente de Prisma.

Izipay y Shalom siguen siendo integraciones preparadas para una fase posterior; sus clientes y webhooks todavía no representan una conexión operativa.
