# webstore

Ecommerce modular (web, admin y mobile) en un monorepo. Un solo producto, una instalación independiente por cliente.

- **Arquitectura, reglas y hoja de ruta:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Decisiones registradas:** [docs/adr/](docs/adr/)

## Empezar

Requisitos: Node.js 20+ y pnpm.

```bash
pnpm install
cp .env.example apps/web/.env.local   # completar valores
pnpm dev                              # http://localhost:3000
```
