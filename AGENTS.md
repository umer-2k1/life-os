# AGENTS.md — Build manual for the implementing agent

You are building **Life OS** ("The Life I'm Building"): a private, single-user AI vision + accountability system. This file is your operating manual. Read it fully before writing code.

---

## 1. Read these first, in order
1. [`docs/00-vision.md`](docs/00-vision.md) — the principles (don't violate them).
2. [`docs/reference/ui-gold-luxury-demo.html`](docs/reference/ui-gold-luxury-demo.html) — **LOCKED** look & feel. Open in a browser. Build to match this.
3. [`docs/07-design-system.md`](docs/07-design-system.md) — tokens, type, color.
4. [`docs/10-ui-build-brief.md`](docs/10-ui-build-brief.md) — screens, states, interactions, bindings.
5. [`docs/01-product-spec.md`](docs/01-product-spec.md) — full feature list.
6. [`docs/02-architecture.md`](docs/02-architecture.md) — system design.
7. [`docs/03-data-model.md`](docs/03-data-model.md) + [`docs/reference/entities.ts`](docs/reference/entities.ts) — data (TypeORM entities = schema source of truth).
8. [`docs/11-api-contract.md`](docs/11-api-contract.md) — routes & payloads.
9. [`docs/04-ai-accountability-engine.md`](docs/04-ai-accountability-engine.md) + [`docs/12-ai-prompts.md`](docs/12-ai-prompts.md) — the AI loop.
10. [`docs/05-mcp-server.md`](docs/05-mcp-server.md), [`docs/06-reports.md`](docs/06-reports.md), [`docs/09-setup.md`](docs/09-setup.md), [`docs/08-roadmap.md`](docs/08-roadmap.md).

---

## 2. Stack (do not substitute without asking)
- **Next.js (App Router, TypeScript strict)** + **Tailwind** + **shadcn/ui**
- **Supabase**: Postgres + Auth (single user) + Storage
- **TypeORM** (entities + migrations) — data layer over Supabase Postgres via `DATABASE_URL`. Schema source of truth: [`docs/reference/entities.ts`](docs/reference/entities.ts). Do **not** hand-write SQL; generate migrations from entities.
- **grammY** for Telegram
- **LiteLLM** or LangChain for AI routing (OpenRouter → Groq → optional Grok/DeepSeek)
- **Groq Whisper** for voice→text
- **Resend** for email
- **@modelcontextprotocol/sdk** for the MCP server
- **Vercel** hosting + **GitHub Actions** cron
- Package manager: **pnpm**

## 3. Golden rule: one shared core
All business logic lives in `core/`. The website, Telegram bot, MCP server, and cron routes are **thin adapters** that call `core/`. Never duplicate logic (e.g. scoring) across adapters. The daily check-in is **channel-agnostic** — every channel funnels into the same `logDay()` in `core/`.

## 4. Conventions
- TypeScript `strict: true`. No `any` without a comment justifying it.
- Validate every external input (API body, bot message, MCP tool args, AI output) with **zod**.
- AI must return **structured JSON**; parse+validate with zod, retry once on invalid, then fail gracefully.
- Server-only secrets never reach the client. API keys entered in Settings are stored **encrypted** in `ai_settings.keys`.
- **RLS on every table** (owner = `auth.uid()`). Service-role key only in server code.
- UI copy obeys the **brevity law**: bullets/keywords, never paragraphs, ≤5 bullets per block.
- **Semantic color** fixed: green = on-track, amber = neutral, red = waste/decay/danger. Never red/green as the only signal.
- **Dark only.** No light theme. Use the design tokens from `07`.
- Protect cron/telegram/mcp endpoints with a shared secret / signed webhook.
- Commits: small, conventional (`feat:`, `fix:`, `docs:`).

## 5. Build order + Definition of Done (per milestone)
Follow [`docs/08-roadmap.md`](docs/08-roadmap.md). "Done" for each:

| M | Milestone | Done when |
|---|-----------|-----------|
| M0 | Foundations | App boots on Vercel; Supabase Postgres connected via TypeORM DataSource; initial migration generated from `entities.ts` runs clean; auth gates the app (single user); `core/` + folder structure in place; env documented. |
| M1 | Dreams + emotional anchor | CRUD dreams w/ images (Storage), emotional anchor, milestones, savings link; grid + detail sheet match the demo; 8 seed dreams load. |
| M2 | Accountability loop | Telegram linked; 12 AM ask + voice/text intake; Whisper transcribes; AI provider routing + Settings; parse→activities→score→recap; GH Actions hourly cron + re-ask state machine working. |
| M3 | Tracking & gamification | Kanban board; heatmap; points/levels/streaks; calendar + date-range filter; decay alerts. |
| M4 | Money + reflection | Savings trackers + history; North Star rollup; daily reflection with priced waste. |
| M5 | Dashboard | Home assembles all widgets per the demo; live clock; "why you started" rotation; motion pass. |
| M6 | Reports | Weekly/monthly/custom; trajectory math; Resend email + PDF to Storage; history page. |
| M7 | MCP server | `/api/mcp` remote server, auth, all tools from `05` wired to `core/`; verified from an MCP client. |
| M8 | PWA + notifications + backups | Installable PWA; web push + prefs; scheduled Supabase backup. |
| M9 | Polish | a11y, reduced-motion, mobile, empty/error states, onboarding, final copy. |

After each milestone: run typecheck + lint + build, and verify the DoD above before moving on.

## 6. What to confirm with the human (don't assume)
- Supabase project URL + keys, Postgres connection string.
- Telegram bot token (@BotFather) + which chat is the user.
- Resend key + from-address/domain.
- OpenRouter + Groq keys (Grok/DeepSeek optional).
- Custom domain.
- Currency/timezone defaults (used in savings + cron windows).

## 7. Do NOT
- Do not ship the reference HTML as the app — rebuild it in Next.js.
- Do not add a light theme, corporate styling, or paragraph-heavy copy.
- Do not commit any secret, `.env`, key, token, DB URL, or personal data/photos.
- Do not bypass `core/` from an adapter.
- Do not invent user data; seed only the 8 dreams defined in `01`/`03` (or what the human provides).
- Do not pick paid AI models by default — free-first, with fallback.

## 8. First action (M0)
Scaffold: `pnpm create next-app` (TS, App Router, Tailwind) → add shadcn/ui → add TypeORM (DataSource via `DATABASE_URL`) + Supabase client (Storage/Auth) → copy `docs/reference/entities.ts` into the app → create the folder structure in `docs/02-architecture.md` → wire env from `docs/09-setup.md` → generate & run the initial TypeORM migration → deploy a hello-world to Vercel. Then start M1.
