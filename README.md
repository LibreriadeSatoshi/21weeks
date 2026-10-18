# 21 Weeks

**From interest to your first open source contribution to Bitcoin, in 21 weeks.**

21 Weeks is a bilingual (ES/EN) web app that helps developers and researchers start contributing to open source Bitcoin and Lightning projects. No shitcoins: only Bitcoin, Lightning, Nostr and their free software ecosystem.

## What it does

1. **Profile quiz**: experience, interests and available time.
2. **Catalog of 17 projects**: Bitcoin Core, Core Lightning, LND, LDK, BDK, rust-bitcoin, Electrum, BTCPay Server, mempool.space, JoinMarket, btcd, Fedimint, BOLTs, NIPs, VLS, Nutshell (Cashu) and Mostro.
3. **Live good-first-issues**: real issues pulled from GitHub and GitLab, sorted by fit with your profile (with a filter for issues already claimed or with PRs in progress).
4. **21-week plan**: an AI generates a week-by-week plan (4 h/day) with goals, tasks and real, verified resources. You can export it to Markdown and continue it from any other agent (Claude Code, OpenCode…).
5. **Author-first senior mentor**: a mentoring chat that guides and asks questions but **never does the work for you**, inspired by Bitcoin Core's `doc/AI_POLICY.md`. It grounds its answers in primary sources: [bitcoinknowledge.dev](https://bitcoinknowledge.dev) and [nostrbook.dev](https://nostrbook.dev).

## Stack

React 19 + TypeScript + Vite · Tailwind CSS 4 + ISMOS design system (`design/ismos/`) · Hono + tRPC 11 + superjson · Drizzle ORM (MySQL) · Vercel AI SDK (`ai` + `@ai-sdk/openai-compatible`, versions pinned on purpose)

## Deployment

### Requirements

- Node.js 20+
- A reachable MySQL database
- Access to an OpenAI API-compatible gateway for the mentor and the plans

### 1. Clone and install

```bash
git clone https://github.com/ifuensan/21weeks.git
cd 21weeks
npm install
```

### 2. Create your `.env`

The repo includes no secrets. Copy the template and fill it in:

```bash
cp .env.example .env
```

| Variable                               | Purpose                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `APP_ID` / `APP_SECRET`                | App ID and secret used to sign JWTs (generate a random one: `openssl rand -hex 32`) |
| `DATABASE_URL`                         | MySQL connection string: `mysql://user:pass@host:3306/21weeks`                      |
| `KIMI_AUTH_URL` / `VITE_KIMI_AUTH_URL` | URL of the Kimi OAuth server (if you use Kimi login)                                |
| `KIMI_OPEN_URL`                        | URL of the Kimi open platform                                                       |
| `VITE_APP_ID`                          | OAuth application ID (exposed to the browser)                                       |
| `OWNER_UNION_ID`                       | Union ID of the creator; that user gets the admin role on first login               |

The AI backend also needs these variables **in the server environment** (they do not go in the frontend):

| Variable      | Purpose                                       |
| ------------- | --------------------------------------------- |
| `AI_BASE_URL` | Base URL of an OpenAI API-compatible provider |
| `AI_API_KEY`  | API key for that provider                     |
| `AI_MODEL_ID` | Model ID; required outside the Kimi platform  |

Inside the Kimi platform, `KIMI_AGENTGW_BASE_URL` and `KIMI_AGENTGW_API_KEY` can be used instead of `AI_BASE_URL` and `AI_API_KEY`.

Without an AI provider configured, the app loads, but the mentor, issue recommendations and plan generation will not work.

### 3. Database

```bash
npm run db:push      # creates the tables with Drizzle
```

### 4. Development

```bash
npm run dev          # Vite + API with hot-reload
```

### 5. Production

```bash
npm run build        # frontend build + backend bundle (dist/boot.js)
npm start            # serves everything with NODE_ENV=production (port PORT, 3000 by default)
```

## Structure

```
api/          Hono + tRPC backend (AI mentor, issues, auth)
contracts/  Project catalog and types shared by front and back
db/         Drizzle schema and migrations
src/        React frontend (pages, components, i18n ES/EN)
public/     Official logos of the 17 projects
```

## License and contributions

[MIT](./LICENSE) license. Contributions are governed by the DCO 1.1 and the AI attribution policy; read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before your first commit (`git commit -s` is required).

Open source project born at [Librería de Satoshi](https://libreriadesatoshi.com) / HackNodes Lab. Issues and PRs welcome; that is exactly what this is about. ₿

## Acknowledgements

<a href="https://libreriadesatoshi.com"><img src="public/logos/libreria-satoshi.png" alt="Librería de Satoshi" height="64"></a>

**This project is only possible thanks to the support of [Librería de Satoshi](https://libreriadesatoshi.com).**
