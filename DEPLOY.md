# Despliegue fuera de Kimi (servidor propio)

21weeks es una app Node 20+ estándar (Vite + Hono + tRPC + MySQL). Fuera de la
plataforma Kimi corre en **modo anónimo** (sin login) y con cualquier proveedor
de IA **OpenAI-compatible**.

## Docker Compose (recomendado)

1. Crea un `.env` junto al `docker-compose.yml`:

```env
AI_BASE_URL=https://api.moonshot.cn/v1
AI_API_KEY=sk-...
AI_MODEL_ID=kimi-k2-0905-preview
```

   Otros endpoints válidos: OpenAI (`https://api.openai.com/v1`,
   `AI_MODEL_ID=gpt-4o`), o un vLLM/Ollama propio con API OpenAI.

2. Levanta:

```bash
docker compose up -d --build
```

App en `http://localhost:3000`. MySQL 8.4 incluido (volumen `dbdata`); las
tablas se autocrean en el primer arranque (utf8mb4 ya configurado).

## Sin Docker (VPS + systemd)

```bash
node --version   # necesitas 20+
npm ci
npm run build    # genera dist/boot.js (servidor) y dist/public (estáticos)

cat > .env <<EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:pass@127.0.0.1:3306/21weeks
AI_BASE_URL=...
AI_API_KEY=...
AI_MODEL_ID=...
EOF

NODE_ENV=production node dist/boot.js
```

Sirve el puerto 3000 detrás de tu reverse proxy (nginx/Caddy) con HTTPS.
Ojo con los timeouts del proxy: la generación de planes es asíncrona
(job + sondeo cada 4 s), así que basta con timeouts estándar de 60 s.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | sí | `mysql://user:pass@host:3306/db` (charset utf8mb4) |
| `AI_BASE_URL` | sí* | endpoint OpenAI-compatible, sin barra final |
| `AI_API_KEY` | sí* | API key del proveedor |
| `AI_MODEL_ID` | sí* | id del modelo (fuera de Kimi no hay autodetección fiable) |
| `PORT` | no | por defecto 3000 |
| `APP_ID`, `APP_SECRET`, `KIMI_AUTH_URL`, `KIMI_OPEN_URL`, `OWNER_UNION_ID` | no | solo para "Sign in with Kimi" dentro de la plataforma; ausentes = modo anónimo |
| `KIMI_AGENTGW_BASE_URL`, `KIMI_AGENTGW_API_KEY` | no | gateway de la plataforma Kimi; si existen se usan como fallback de `AI_*` |

\* fuera de la plataforma Kimi.

## Notas

- **Login**: fuera de Kimi no hay cuentas; el perfil y el progreso viven en el
  navegador del usuario (localStorage). El callback OAuth responde 501.
- **Límites de coste**: el plan de 21 semanas y el chat consumen tokens de TU
  API key. Si abres el sitio al público, pon rate-limit en tu proxy.
- **Skill 21w-mentor**: si editas datos de proyectos, hazlo en
  `contracts/catalog.ts` y regenera overlays con `npm run skill:overlays`.
