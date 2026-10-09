# webstore

```bash
cp .env.example .env     # ya existe una copia local
docker compose up -d     # Postgres (requiere Docker)
npm run db:generar
npm run db:migrar
npm run dev              # web :3000, admin :3001
```
