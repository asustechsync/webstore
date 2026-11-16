# Base de datos (Supabase)

- `migrations/`: una migración por módulo. **RLS activado en cada tabla**, con índices.
- `tests/`: pruebas de permisos RLS (un cliente nunca ve datos de otro usuario).
- `functions/`: Edge Functions (webhooks de pago con firma verificada, colas).
- `seed.sql`: datos de prueba para desarrollo.

Se inicializa con `supabase init` al crear el módulo `catalog`.
