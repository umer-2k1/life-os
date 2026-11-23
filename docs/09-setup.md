# 09 · Setup & Environment

> No app code yet — this lists what the build will need. Nothing secret lives in the repo.

## Accounts needed (all free tiers)
- **Supabase** — Postgres + Auth + Storage. (You provide the project / connection string.)
- **Vercel** — hosting (Hobby). Connect this GitHub repo.
- **Telegram** — a bot via @BotFather (free).
- **Resend** — email reports (free 3k/mo).
- **OpenRouter** — free models (key). **Groq** — free key (fallback + Whisper).
- Optional: **Grok (xAI)**, **DeepSeek** keys (you may skip).
- **GitHub Actions** — cron (already have, free).

## Env vars (planned `.env.local`)
```bash
# Supabase
# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Supabase Storage (optional fallback)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=                 # pooled Postgres connection (Drizzle)

# Auth
AUTH_SECRET=                  # app session cookie signing (PIN lives in the DB)

# AI (free-first; user can add more in Settings UI too)
OPENROUTER_API_KEY=
GROQ_API_KEY=                 # also used for Whisper
XAI_API_KEY=                  # optional (Grok)
DEEPSEEK_API_KEY=             # optional

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=
REPORT_FROM_EMAIL=

# Cron / internal
CRON_SHARED_SECRET=           # GitHub Actions → API routes
MCP_AUTH_TOKEN=               # MCP client access

# App
APP_URL=
TIMEZONE=                     # e.g. Asia/Karachi
```

## GitHub Actions cron (concept)
`.github/workflows/check-ins.yml` — runs hourly, curls `POST $APP_URL/api/cron/check-ins` with `CRON_SHARED_SECRET`. The route decides who's due (daily ask / 6h re-ask) and sends Telegram messages.
`.github/workflows/reports.yml` — Mondays + 1st of month → `/api/cron/reports`.

## Local dev (future)
```bash
pnpm install
pnpm dev            # Next.js
# Telegram: use a tunnel (ngrok) for webhook in dev
```

## What you'll hand me when we build
- Supabase project URL + keys (or let me scaffold and you paste).
- Telegram bot token (from @BotFather).
- Resend key + a from-address/domain.
- OpenRouter + Groq keys.
- Your custom domain.

## What never goes in the repo
- Any `.env*`, keys, tokens, Postgres URL, personal data, photos.
- `.gitignore` already blocks these.
