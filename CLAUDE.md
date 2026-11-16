# Instrucciones para trabajar en webstore

**Lee `ARCHITECTURE.md` antes de cualquier cambio.** Es la fuente de verdad: estructura final,
anatomía de módulos, reglas de dependencias, seguridad y hoja de ruta.

Al trabajar:
- Construye en el orden de la hoja de ruta (`ARCHITECTURE.md` §7). Un módulo a la vez.
- Todo módulo nuevo parte de `docs/templates/module/` y sigue el checklist de §6.
- Importa paquetes solo por su puerta de entrada (`@webstore/<paquete>`), nunca `src/...`.
- Cada tabla nueva: migración en `supabase/migrations/` con RLS e índices, y pruebas de permisos.
- Valida toda entrada externa con Zod. Ningún secreto en el código ni en git.
- Al terminar un paso, marca su avance en `ARCHITECTURE.md` (§3 y §7).
- Si una decisión cambia la arquitectura: actualiza `ARCHITECTURE.md` y agrega un ADR en `docs/adr/`.
- Verifica antes de dar algo por terminado: `pnpm lint && pnpm typecheck && pnpm build`.
- Responde al usuario en español.
