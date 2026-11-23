# 13 · Keys you need (and how to get each one)

Copy `.env.example` → `.env.local` and fill it in. Everything works locally with
**only** `DATABASE_URL` + `AUTH_SECRET`; the rest unlocks
features progressively.

| Variable | Required? | Unlocks |
|---|---|---|
| `DATABASE_URL` | ✅ yes | Everything (dreams, logs, scores) |
| `AUTH_SECRET` | ✅ yes | Signs the PIN session cookie (PIN itself is hashed in the DB) |
| `OPENROUTER_API_KEY` | ⭐ strongly recommended | AI parsing, scoring, recap, reports |
| `GROQ_API_KEY` | ⭐ recommended | Fallback AI + **voice → text** |
| `TELEGRAM_BOT_TOKEN` | for the daily bot | Auto daily ask, voice notes |
| `TELEGRAM_WEBHOOK_SECRET` | with Telegram | Webhook verification |
| `CRON_SHARED_SECRET` | with Telegram | Hourly re-ask cron |
| `SUPABASE_*` | optional | Image uploads (else paste URLs) |
| `RESEND_API_KEY` + `REPORT_FROM_EMAIL` | optional | Emailed reports |
| `MCP_AUTH_TOKEN` | optional | Drive it from Claude / MCP clients |
| `XAI_API_KEY`, `DEEPSEEK_API_KEY` | optional | Extra AI fallbacks |

---

## 1. Supabase (database — 2 minutes)

1. Go to <https://supabase.com> → **Sign in** → **New project**.
2. Name it `life-os`, pick the region closest to you, set a DB password, create.
3. Wait ~2 min for provisioning.
4. Open **Project Settings → Database → Connection string → URI**.
5. Copy it into `DATABASE_URL`. Replace `[YOUR-PASSWORD]` with the DB password.
   - For `DATABASE_URL` use the **Session pooler / pooled** string (port `6543`).
   - Keep `DATABASE_SSL=true`.
6. (Local alternative: any Postgres works, e.g. Docker
   `docker run -d -p 5433:5432 -e POSTGRES_USER=lifeos -e POSTGRES_PASSWORD=lifeos -e POSTGRES_DB=lifeos postgres:16-alpine`
   → `postgresql://lifeos:lifeos@localhost:5433/lifeos`.)

No Supabase Auth setup needed — Life OS uses its own single-password gate.

## 2. Auth secret (10 seconds)

```bash
openssl rand -base64 48   # → AUTH_SECRET
```

The login PIN is **not** an env var. First run seeds `252525`; change it in
Settings → Security (scrypt-hashed in Postgres).

## 3. OpenRouter (free AI models — 1 minute)

1. <https://openrouter.ai> → sign up / sign in.
2. **Keys** → **Create key** → name it `life-os`.
3. Copy into `OPENROUTER_API_KEY` (`sk-or-v1-…`).
4. Free models are automatically detected (pricing = 0) in Settings.

## 4. Groq (fallback AI + Whisper voice — 1 minute)

1. <https://console.groq.com> → sign in.
2. **API Keys** → **Create API Key**.
3. Copy into `GROQ_API_KEY` (`gsk_…`). Used for `whisper-large-v3` too.

## 5. Telegram bot (5 minutes)

1. Open Telegram, message **@BotFather** → `/newbot`.
2. Name it (e.g. `My Life OS`), username must end in `bot` (e.g. `umars_lifeos_bot`).
3. Copy the token (`123456:ABC…`) into `TELEGRAM_BOT_TOKEN`.
4. Generate the webhook secret: `openssl rand -hex 32` → `TELEGRAM_WEBHOOK_SECRET`.
5. After deploy (or with a tunnel), register the webhook:
   ```bash
   curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
     -d "url=$APP_URL/api/telegram" \
     -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
   ```
6. Message the bot `/start` — it links your chat automatically.

## 6. Cron secret (10 seconds)

1. `openssl rand -hex 32` → `CRON_SHARED_SECRET`.
2. In GitHub: **Settings → Secrets and variables → Actions** → add
   `APP_URL` and `CRON_SHARED_SECRET` (the included workflows use them).

## 7. Resend (optional email reports)

1. <https://resend.com> → sign up.
2. **API Keys** → **Create** → copy into `RESEND_API_KEY` (`re_…`).
3. Add + verify a domain under **Domains**, then set `REPORT_FROM_EMAIL`
   (e.g. `Life OS <reports@yourdomain.com>`). For quick tests
   `onboarding@resend.dev` works but can only email your own address.

## 8. Cloudinary (image uploads — used by this build)

1. <https://cloudinary.com> → sign up (free tier).
2. Dashboard → **Product Environment Credentials**.
3. Copy:
   - Cloud name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET` (server-only)

Images are uploaded to the `life-os/` folder and stored as secure URLs.

**Supabase Storage is an optional fallback** (`NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, public bucket `lifeos`). Without either provider,
uploads are disabled and you can paste image URLs.

## 9. MCP token (optional)

1. `openssl rand -hex 32` → `MCP_AUTH_TOKEN`.
2. Point your MCP client at `$APP_URL/api/mcp` with
   `Authorization: Bearer <MCP_AUTH_TOKEN>`.

---

## Minimum to run locally right now

```bash
DATABASE_URL=postgresql://lifeos:lifeos@localhost:5433/lifeos
DATABASE_SSL=false
AUTH_SECRET=<openssl rand -base64 48>
```

Then: `pnpm install && pnpm db:migrate && pnpm db:seed && pnpm dev`.
