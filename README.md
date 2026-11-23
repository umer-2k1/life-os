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

🟡 **Planning / specs** — no application code yet. This repo currently holds the full design in [`docs/`](docs/).

| Area | Decision |
|------|----------|
| Framework | Next.js (App Router) + Tailwind + shadcn/ui |
| Database / Auth / Storage | Supabase (Postgres + Auth + Storage) |
| AI | OpenRouter (free models) → Groq fallback → optional Grok/DeepSeek keys, via LiteLLM/LangChain |
| Voice → text | Groq Whisper |
| Daily check-in | Channel-agnostic — ask & answer via Telegram (voice/text), MCP (any connected/cloud agent), or Web/PWA; first answer closes it everywhere |
| Scheduler (6-hour re-ask) | GitHub Actions cron → API route (Vercel free cron can't do sub-daily) |
| Email reports | Resend |
| MCP | Remote MCP server in the same TypeScript codebase, shared data layer |
| Hosting | Vercel (free/Hobby) + custom domain |
| PWA / Push | installable PWA + web push (where supported) + Telegram as the reliable channel |

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

---

_Private project. Built for one person, on purpose._
