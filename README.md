# The Life I'm Building

> **Make a shit ton of money. Nobody cares about it.**

A private, AI-driven **vision + accountability system** for one person — built to turn big dreams into daily, obsessive action and to make procrastination impossible to ignore.

This is **not** a to-do app and **not** a pretty vision board. It is a system that:

- **Reaches out to you** every day (Telegram, voice or text) instead of waiting to be opened.
- **Scores your day** against your real goals and prices wasted time as *days stolen from your dreams*.
- **Makes neglect loud** — streaks that break, dreams that decay in red, a trajectory number that moves.
- **Lets you drive it without forms** — through the Telegram bot *and* an **MCP server** (talk to Claude/any MCP client: "add a dream", "log my day", "show this week").
- **Keeps you emotionally hooked** — every dream carries its raw emotional *why*, resurfaced on purpose.

---

## Core principle

> The dashboard is the trophy room. **The bot is the product.**
> A procrastinator won't open an app. So the system comes to him — and makes a bad day louder than a good one.

---

## Status

🟢 **Built and running** — dashboard, dreams, activity board, AI scoring, Telegram loop, reports, MCP server, PWA.

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Login with your 6-digit PIN (default `252525`, change it in Settings).

| Area | Decision |
|------|----------|
| Framework | Next.js 16 (App Router) + Tailwind 4 + shadcn-style primitives |
| Database | Supabase Postgres via TypeORM (migrations in `src/db/migrations`) |
| Auth | Single-user 6-digit PIN (scrypt hash + signed cookie) |
| Images | Cloudinary (Supabase Storage fallback) |
| AI | Groq → OpenRouter free models → optional Grok/DeepSeek, with offline heuristic fallback |
| Voice → text | Groq Whisper |
| Daily check-in | Channel-agnostic — Telegram, MCP, or Web; first answer closes it everywhere |
| Scheduler | GitHub Actions hourly → `/api/cron/check-ins` |
| Email reports | Resend + PDF |
| MCP | Remote Streamable HTTP at `/api/mcp` (29 tools) |
| Hosting | Vercel + custom domain |
| PWA | Installable, offline shell |

---

## Documentation

Read in order:

1. [`docs/00-vision.md`](docs/00-vision.md) — the soul, the psychology, the non-negotiable principles
2. [`docs/01-product-spec.md`](docs/01-product-spec.md) — every feature, in detail
3. [`docs/02-architecture.md`](docs/02-architecture.md) — tech stack, system design, the free-tier plan
4. [`docs/03-data-model.md`](docs/03-data-model.md) — Supabase schema
5. [`docs/04-ai-accountability-engine.md`](docs/04-ai-accountability-engine.md) — the bot, scoring, re-ask logic, AI fallback
6. [`docs/05-mcp-server.md`](docs/05-mcp-server.md) — MCP tools spec
7. [`docs/06-reports.md`](docs/06-reports.md) — weekly/monthly intelligence + email
8. [`docs/07-design-system.md`](docs/07-design-system.md) — dark luxury UI spec
9. [`docs/08-roadmap.md`](docs/08-roadmap.md) — build milestones
10. [`docs/09-setup.md`](docs/09-setup.md) — env vars & running it
11. [`docs/10-ui-build-brief.md`](docs/10-ui-build-brief.md) — developer-ready, screen-by-screen UI instructions
12. [`docs/11-api-contract.md`](docs/11-api-contract.md) — API routes & payloads
13. [`docs/12-ai-prompts.md`](docs/12-ai-prompts.md) — AI prompt templates + JSON output schemas
14. [`docs/reference/entities.ts`](docs/reference/entities.ts) — **TypeORM** entities (schema source of truth)
15. [`docs/13-env-keys.md`](docs/13-env-keys.md) — every key, and how to get it
16. [`docs/14-handoff.md`](docs/14-handoff.md) — what is built, what is left
17. [`docs/15-deploy.md`](docs/15-deploy.md) — Vercel, webhook, cron, MCP
18. [`docs/16-usage.md`](docs/16-usage.md) — how to actually use it daily

> 🤖 **Implementing agent:** start at [`AGENTS.md`](AGENTS.md) — stack, conventions, build order, and per-milestone done-criteria.

> ✅ **Design LOCKED — "Gold Luxury" (dark).** Visual source of truth: [`docs/reference/ui-gold-luxury-demo.html`](docs/reference/ui-gold-luxury-demo.html) (open in a browser) + [`docs/reference/README.md`](docs/reference/README.md). The implementing agent builds the Next.js app to match this demo's feel — not its sample data.

---

_Private project. Built for one person, on purpose._
