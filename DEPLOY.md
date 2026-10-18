# Deploying outside Kimi (your own server)

21weeks is a standard Node 20+ app (Vite + Hono + tRPC + MySQL). Outside the
Kimi platform it runs in **anonymous mode** (no login) and with any
**OpenAI-compatible** AI provider.

## Docker Compose (recommended)

1. Create a `.env` next to `docker-compose.yml`:

```env
AI_BASE_URL=https://api.moonshot.cn/v1
AI_API_KEY=sk-...
AI_MODEL_ID=kimi-k2-0905-preview
```

Other valid endpoints: OpenAI (`https://api.openai.com/v1`,
`AI_MODEL_ID=gpt-4o`), or your own vLLM/Ollama with an OpenAI API.

2. Start it:

```bash
docker compose up -d --build
```

App at `http://localhost:3000`. MySQL 8.4 included (volume `dbdata`); the
tables are created automatically on first start (utf8mb4 already configured).

## Without Docker (VPS + systemd)

```bash
node --version   # you need 20+
npm ci
npm run build    # generates dist/boot.js (server) and dist/public (static files)

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

Serve port 3000 behind your reverse proxy (nginx/Caddy) with HTTPS.
Watch the proxy timeouts: plan generation is asynchronous
(job + polling every 4 s), so standard 60 s timeouts are enough.

## Environment variables

| Variable                                                                   | Required | Description                                                               |
| -------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`                                                             | yes      | `mysql://user:pass@host:3306/db` (charset utf8mb4)                        |
| `AI_BASE_URL`                                                              | yes*     | OpenAI-compatible endpoint, no trailing slash                             |
| `AI_API_KEY`                                                               | yes*     | provider API key                                                          |
| `AI_MODEL_ID`                                                              | yes*     | model id (outside Kimi there is no reliable autodetection)                |
| `PORT`                                                                     | no       | 3000 by default                                                           |
| `APP_ID`, `APP_SECRET`, `KIMI_AUTH_URL`, `KIMI_OPEN_URL`, `OWNER_UNION_ID` | no       | only for "Sign in with Kimi" inside the platform; absent = anonymous mode |
| `KIMI_AGENTGW_BASE_URL`, `KIMI_AGENTGW_API_KEY`                            | no       | Kimi platform gateway; if present they are used as a fallback for `AI_*`  |

\* outside the Kimi platform.

## Notes

- **Login**: outside Kimi there are no accounts; the profile and progress live in
  the user's browser (localStorage). The OAuth callback returns 501.
- **Cost limits**: the 21-week plan and the chat consume tokens from YOUR
  API key. If you open the site to the public, add rate limiting in your proxy.
- **21w-mentor skill**: if you edit project data, do it in
  `contracts/catalog.ts` and regenerate overlays with `npm run skill:overlays`.
