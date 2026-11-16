# ADR 0002: Una instalación independiente por cliente (no SaaS)

- **Estado:** aceptado
- **Fecha:** 2026-11-16

## Contexto
El producto se venderá a cada negocio por separado, no como una plataforma compartida.

## Decisión
- Cada cliente tiene su propio proyecto de Vercel y su propia base de Supabase.
- **Un solo código para todos.** Los clientes se diferencian solo por `clients/<cliente>/client.config.ts` (marca, módulos activos) y sus assets.
- No se usa `tenant_id`: el aislamiento lo da la base separada.
- Los pedidos especiales se construyen como módulos activables por config, nunca como fork.
- Versionado del producto en `CHANGELOG.md`; migraciones aplicadas a cada base con un script.

## Consecuencias
- Datos totalmente aislados por cliente y fallas que no se propagan entre clientes.
- Hay que operar N despliegues; se mitiga con scripts y CI de despliegue por cliente.
- La carpeta `clients/` y los scripts se crean al llegar el segundo cliente.
