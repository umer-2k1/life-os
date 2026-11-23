# 02 · Architecture

## Guiding rule
**One TypeScript codebase. One deploy. Shared core.** The website, the Telegram bot, the MCP server, and the cron jobs all call the **same service layer** — so logic lives once and bugs don't get duplicated.

## System overview

```
                         ┌─────────────────────────────┐
                         │        Supabase (free)        │
                         │  Postgres · Auth · Storage    │
                         └──────────────┬───────────────┘
                                        │
                              ┌─────────▼──────────┐
                              │  core/ service layer │  ← all business logic lives here
                              │  (dreams, scoring,    │
                              │   logs, reports, AI)  │
                              └───┬─────┬─────┬───┬──┘
                                  │     │     │   │
        ┌─────────────────┐  ┌────▼─┐ ┌─▼───┐ ┌▼──────┐ ┌▼────────────┐
        │  Next.js web /  │  │ MCP  │ │ Tgm │ │ Cron  │ │  AI layer    │
        │  PWA (dashboard)│  │server│ │ bot │ │ (GH   │ │ LiteLLM/LC   │
        │                 │  │(HTTP)│ │     │ │Actions)│ │ OR→Groq→...  │
        └─────────────────┘  └──────┘ └─────┘ └───────┘ └──────────────┘
                                        │
                                 ┌──────▼──────┐   ┌──────────────┐
                                 │  Telegram    │   │   Resend      │
                                 │  (voice/text)│   │  (email rpts) │
                                 └──────────────┘   └──────────────┘
```

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js (App Router, TS)** | UI + API routes + serverless in one |
| UI | **Tailwind + shadcn/ui** | fast, clean, dark-luxury-friendly |
| DB / Auth / Storage | **Supabase** | Postgres + single-user auth + image storage, one free tier |
| ORM | **Drizzle** (or Prisma) | typed schema, migrations |
| AI routing | **LiteLLM / LangChain** | multi-provider, model picker, auto-fallback |
| Voice → text | **Groq Whisper** | free/cheap, fits stack |
| Bot | **Telegram Bot API** (grammY) | best free voice+text, reliable mobile |
| Scheduler | **GitHub Actions cron** → API route | free sub-daily triggers (see below) |
| Email | **Resend** | easiest free, 3k/mo |
| MCP | **@modelcontextprotocol/sdk** (remote HTTP) | expose core as tools |
| Hosting | **Vercel (Hobby)** + custom domain | free, simple |
| PWA | next-pwa / manifest + service worker | installable + web push |

## Suggested repo layout (monorepo-lite)

```
life-os/
├─ docs/
├─ app/                 # Next.js App Router (dashboard, API routes)
│  ├─ (dashboard)/
│  └─ api/
│     ├─ cron/          # endpoints hit by GitHub Actions
│     ├─ telegram/      # webhook
│     └─ mcp/           # remote MCP endpoint
├─ core/                # ← shared business logic (the heart)
│  ├─ dreams/
│  ├─ logs/
│  ├─ scoring/
│  ├─ reports/
│  ├─ savings/
│  └─ ai/               # provider routing, prompts
├─ db/                  # drizzle schema + migrations
├─ components/          # shadcn + custom
├─ lib/                 # supabase client, auth, utils
├─ bot/                 # telegram handlers (call core/)
├─ mcp/                 # mcp tool definitions (call core/)
├─ .github/workflows/   # cron schedules
└─ public/              # pwa manifest, icons
```

## The scheduler problem (important, and solved for free)
- **Vercel Hobby cron can't run sub-daily reliably** — it's meant for ~once/day.
- The **6-hour re-ask** needs finer timing.
- **Solution (free): GitHub Actions scheduled workflow** pings a secured API route (e.g. `/api/cron/check-ins`) every hour. The route decides per-user whether a ping/re-ask is due based on stored state (last asked, last answered, today's window).
- Alternatives if ever needed: cron-job.org (free), Upstash QStash (free tier). All hit the same endpoint.

### Re-ask state machine (lives in DB, evaluated by the hourly cron)
- `12:00 AM` → send daily ask → set `asked_at`, `answered=false`.
- Hourly cron: if `answered=false` AND `now - last_ping >= 6h` AND within allowed window → re-ask.
- On any reply → `answered=true`, stop until next `12:00 AM`.
- Quiet hours respected (don't spam overnight beyond the defined windows).

## AI provider routing (free-first)
- Order: **OpenRouter free models** → **Groq** → optional **Grok (xAI)** key → optional **DeepSeek** key.
- Configurable from **Settings UI**: add API keys, pick model, set fallback order.
- If no model chosen → system auto-picks a free model; on rate-limit → auto-fall to next.
- Model catalog fetched from **OpenRouter `/models`** endpoint (so the picker always shows current free models).
- Detail in [`04-ai-accountability-engine.md`](04-ai-accountability-engine.md).

## Security / privacy
- Single user. Supabase Row Level Security on all tables (owner-only).
- All secrets in env (never committed). API keys entered in Settings stored encrypted in DB.
- Cron + Telegram + MCP endpoints protected by shared secret / signed webhook.
- Private repo content is fine to be public (it's docs); **no secrets, no personal data in the repo**.

## Deploy
- Vercel project ← GitHub repo. Env vars set in Vercel.
- Supabase project (region near me). Migrations via Drizzle.
- Telegram webhook → `/api/telegram`.
- GitHub Actions secret = cron shared secret.
- Custom domain → Vercel.
