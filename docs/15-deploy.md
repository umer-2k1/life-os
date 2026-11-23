# 15 · Deploy

## 1. Vercel

1. vercel.com → **Add New Project** → import `umer-2k1/life-os`.
2. Framework preset: **Next.js**. Build: `pnpm build`. Install: `pnpm install`.
3. Add environment variables (Production + Preview) from your local `.env`,
   except `DATABASE_URL` if you prefer the pooled one.
   - Use the **pooled** Supabase URL (port `6543`) on Vercel.
   - `DATABASE_SSL=true`
   - `APP_URL=https://your-domain.vercel.app`
4. Deploy.

## 2. Database

From your machine, with the **direct/session** URL in `.env`:

```bash
pnpm db:migrate
pnpm db:seed
```

`db:seed` only inserts when there are zero dreams.

## 3. Telegram webhook

1. Open the deployed app → **Settings** → **Register webhook**.
2. In Telegram, send `/start` to your bot once.
3. Test: send a voice note or text. Expected reply: score + bullets + next action.

If registration fails, check `TELEGRAM_WEBHOOK_SECRET` matches the webhook call and
`APP_URL` is public HTTPS.

## 4. Cron (GitHub Actions)

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `APP_URL` | `https://your-domain` |
| `CRON_SHARED_SECRET` | same value as the env var |

Workflows: `.github/workflows/check-ins.yml` (hourly) and `reports.yml` (Mon + 1st).

## 5. MCP client

Remote endpoint: `https://your-domain/api/mcp`

Claude Desktop example:

```json
{
  "mcpServers": {
    "life-os": {
      "type": "http",
      "url": "https://your-domain/api/mcp",
      "headers": { "Authorization": "Bearer <MCP_AUTH_TOKEN>" }
    }
  }
}
```

Try: “Show my dreams” · “Log my day: shipped the landing page, wasted 2h on YouTube”.

## 6. PWA

Open the site on your phone → **Add to Home Screen**. Service worker is production-only.

## 7. Backups

Supabase → Database → Backups (daily on paid plans). For free tier, schedule a
`pg_dump` from GitHub Actions with the direct connection string.

## Security checklist

- [ ] PIN changed from `252525`.
- [ ] `.env` never committed (gitignored).
- [ ] `AUTH_SECRET`, `CRON_SHARED_SECRET`, `MCP_AUTH_TOKEN` are random.
- [ ] Supabase DB password not reused elsewhere.
- [ ] Cloudinary API secret server-only (never `NEXT_PUBLIC_`).
