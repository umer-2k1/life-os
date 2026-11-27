# Architecture

> Plain-language technical reference for how Life OS works under the hood.
> Deeper specs: [`02-architecture.md`](02-architecture.md), [`03-data-model.md`](03-data-model.md), [`04-ai-accountability-engine.md`](04-ai-accountability-engine.md).

---

## 1. What the system is

One private account. One database. Four doors into the same logic:

```
Telegram bot  ─┐
Website / PWA ─┼──►  core/  ──►  Postgres (Supabase)
MCP server    ─┤        │
Cron jobs     ─┘        ├──► AI providers (Groq / OpenRouter / xAI / DeepSeek)
                        ├──► Groq Whisper (voice → text)
                        ├──► Cloudinary (images)
                        └──► Resend (email + PDF reports)
```

The rule: **business logic lives once in `core/`**. The website, bot, MCP server and cron routes are thin adapters. If scoring changes, it changes everywhere at once.

---

## 2. Stack and why

| Layer | Technology | Why |
|---|---|---|
| Web | Next.js 16 (App Router, TypeScript strict) | UI + API + server actions in one deploy |
| Styling | Tailwind CSS 4 + shadcn-style components | design tokens in CSS, no runtime CSS-in-JS |
| DB | Postgres (Supabase) | managed, free tier, direct SQL |
| ORM | TypeORM 0.3 + migrations | typed entities, generated schema, no hand-written SQL |
| Auth | 6-digit PIN + JWT cookie (`jose`) | no email/Supabase Auth setup, single user |
| AI | Groq → OpenRouter → xAI → DeepSeek | free-first, JSON mode, automatic fallback |
| Voice | Groq `whisper-large-v3` | cheap, fast, good enough for one person |
| Images | Cloudinary | uploads + transforms, no server disk |
| Reports | `pdf-lib` + Resend | PDF generated on demand, emailed |
| Bot | Telegram Bot API (direct HTTP) | no framework overhead, easy webhook |
| Scheduler | GitHub Actions hourly → API route | Vercel Hobby can't do reliable sub-daily cron |
| MCP | `@modelcontextprotocol/sdk`, Streamable HTTP | drive the system from Claude/any MCP client |
| Hosting | Vercel + custom domain | free, Git-connected |

---

## 3. Repository map

```
src/
├─ app/
│  ├─ (app)/                 # authenticated shell + pages
│  │  ├─ page.tsx            # dashboard
│  │  ├─ dreams/             # grid, sheet, forms, actions
│  │  ├─ activity/           # kanban + log composer
│  │  ├─ reports/            # generate + history
│  │  └─ settings/           # profile, PIN, AI, notifications
│  ├─ login/                 # PIN screen (OTP input)
│  ├─ api/
│  │  ├─ auth/login          # PIN → session cookie
│  │  ├─ dreams, activities, scores, savings, reports
│  │  ├─ checkin, logs, profile, settings
│  │  ├─ cron/check-ins      # hourly ask / re-ask
│  │  ├─ cron/reports        # weekly / monthly
│  │  ├─ telegram            # webhook
│  │  ├─ telegram/setup      # register webhook + status
│  │  ├─ mcp                 # remote MCP endpoint
│  │  └─ upload              # Cloudinary upload
│  ├─ manifest.ts            # PWA manifest
│  └─ proxy.ts               # auth gate (Next 16 "middleware")
├─ core/                     # THE product logic
│  ├─ ai/                    # router, prompts, schemas, heuristic
│  ├─ dreams.ts, savings.ts, logs.ts, scores.ts
│  ├─ activities.ts, checkin.ts, dashboard.ts
│  ├─ reports.ts, storage.ts, security.ts, settings.ts
│  └─ telegram/              # api client + handler
├─ db/
│  ├─ entities/              # 15 TypeORM tables
│  ├─ migrations/            # generated, committed
│  └─ data-source.ts         # Postgres connection (pool max 2)
├─ components/               # UI primitives + dashboard/dream widgets
├─ lib/                      # env, auth, crypto, pin, dates, utils, rate-limit
└─ mcp/server.ts             # 29 MCP tools
```

---

## 4. Data model (15 tables)

| Table | Holds |
|---|---|
| `profiles` | North Star, identity line, motto, timezone, currency, PIN hash |
| `dreams` | title, cover, glyph, priority, target date, money, progress, last touched |
| `dream_emotions` | the why: story, raw reason, feeling, voice note |
| `dream_images` | gallery |
| `milestones` | checklist per dream |
| `savings` | target + saved per dream |
| `savings_entries` | history of money in/out |
| `daily_logs` | one per day: raw input, score, bullets, next action, ask state |
| `activities` | parsed actions: relevance, points, days cost, kanban column |
| `reflections` | accomplished / wasted / improve |
| `reports` | weekly/monthly/custom markdown + narrative JSON |
| `scores_daily` | fast heatmap source |
| `ai_settings` | provider order, model, **encrypted** keys |
| `notification_prefs` | ask time, re-ask gap, quiet hours, channels |
| `telegram_links` | the one linked chat |

Money is stored in **minor units** (paisa/cents) as `bigint` + `currency`.

---

## 5. The daily loop, step by step

### 5.1 The ask

1. GitHub Actions runs every hour: `POST /api/cron/check-ins` with `x-cron-secret`.
2. `runCheckinCron()` loads prefs + profile.
3. If today's log is already `answered` → stop.
4. Work out **which day the ask is about**:
   - ask time before noon → **yesterday** (the day that just ended)
   - ask time in the evening → today
   Then send the question at/after `daily_ask_time` and mark `asked_at`.
5. If asked but unanswered → re-ask only when:
   - `now - last_ping_at >= reask_gap_hours`, and
   - the local time is **outside** quiet hours (quiet hours only block re-asks, not the first ask).
6. Message text names the day being reviewed:
   `"Report for Wednesday, November 25 — what did you do that day toward the money / the dreams? Voice or text."`
   Replies are logged to **that date**, not blindly to today.

### 5.2 Voice message path

```
Telegram voice (.oga)
   │  POST /api/telegram  (secret header checked)
   ▼
getFile → download binary
   ▼
Groq Whisper  model: whisper-large-v3
   │  NOTE: Groq rejects ".oga"; we upload it as "voice.ogg"
   ▼
transcript text
   ▼
same pipeline as text (5.3)
```

If transcription fails, the bot replies “send it as text” instead of silently dropping it.

### 5.3 Text / web / MCP path

```
raw text
  │
  ├─ 1. Reject non-updates ("hello", "test", "first message")
  │      → reply asks for a real update, nothing is scored
  │
  ├─ 2. AI parse (if a key exists)
  │      Groq/OpenRouter JSON mode → zod-validated array of activities
  │      fields: text, dream_title, relevance, score_delta, time_cost_days, suggestion
  │
  ├─ 3. Keyword consensus
  │      rule engine + model must agree on relevance:
  │      any "waste" wins → waste; any "on_track" → on_track; else neutral
  │      waste days = hours × 0.7 (from the stated duration)
  │
  ├─ 4. Dream resolution (title match + keyword hints)
  │      "applied to 5 remote jobs" → Remote Job
  │
  ├─ 5. Persist
  │      Telegram/MCP append to today's activities; web "re-log" replaces
  │
  ├─ 6. Score (see §6)
  │
  ├─ 7. Upsert scores_daily, touch linked dreams
  │
  └─ 8. Reply: score, ≤5 bullets, one next action
```

The first answer on any channel sets `answered=true` for **that date**; every other channel then goes quiet until the next day. A morning ask reviews yesterday, so the dashboard shows yesterday’s recap while today’s dial stays empty until today is logged.

---

## 6. Scoring math

### 6.1 Deterministic score (the anchor)

```
raw = 42
+ 16 per on_track
+  5 per neutral
- 18 per waste, minus min(12, round(days_lost × 3))
+ min(streak, 6) × 2
if on_track > 4:  raw = 74 + (raw - 74) × 0.4   // diminishing returns
score = clamp(round(raw), 0, 100)
```

### 6.2 AI score (a nudge, not the boss)

The model returns 0–100 plus bullets. Final:

```
score = round(deterministic × 0.70 + ai × 0.30)
```

The model used to invent scores (“matches recent average 73” for a greeting). Anchoring fixed that.

### 6.3 Safety clamps

- 0 on-track activities → score capped at **30** (or **22** if there was waste).
- Waste ≥ 2 days → capped at **65**.
- **Remote-job priority boost:** each on-track activity linked to a high-priority dream, or matching `remote|job|apply|interview|CV|resume|portfolio|client|freelance`, adds **+5**, capped at **+15**.

### 6.4 Points, levels, streak

- Points: on_track +12, neutral +3, waste −8, answered check-in +5.
- Level: 100, 250, 450, 700, 1000… (span grows by 50 each level).
- Streak: consecutive `answered` days ending today or yesterday.
- Decay: untouched dream turns amber/red after a priority-based threshold (high 3d, medium 7d, low 14d).

---

## 7. Authentication

- Single user. Six-digit PIN.
- Stored as `scrypt$salt$hash` (Node `crypto.scryptSync`) in `profiles.pin_hash`.
- Login compares in constant time, then issues a **HS256 JWT** (30 days) in an `httpOnly`, `SameSite=Lax` cookie. `Secure` is set only when `APP_URL` is HTTPS.
- `src/proxy.ts` (Next 16's renamed middleware) gates every app page and user API route; machine routes (`cron`, `telegram`, `mcp`) have their own secrets.
- Rate limit: 8 attempts / 10 minutes per IP, in-memory.
- First run seeds PIN `252525`; change it in Settings → Security.

---

## 8. AI routing

Order (configurable in `ai_settings.provider_order`, default Groq first):

1. **Groq** — `openai/gpt-oss-120b`
2. **OpenRouter** — free models only (`pricing.prompt === "0"`), catalog fetched live
3. **xAI Grok** (optional key)
4. **DeepSeek** (optional key)

Every call:

- `temperature` 0.2–0.5 depending on task
- `response_format: json_object`
- 45s timeout
- JSON extracted, **validated with zod**
- one retry per provider on malformed output
- on provider error/rate-limit → next provider
- if every provider fails → deterministic heuristic path, the app never blocks

Keys entered in Settings are **encrypted at rest** (AES-256-GCM, key derived from `AUTH_SECRET`).

---

## 9. Images

- Upload → `POST /api/dreams/:id/images` (auth required) → Cloudinary `upload_stream` into `life-os/`.
- Returns a `secure_url` stored in `dream_images` / `dreams.cover_image_url`.
- Fallback: Supabase Storage if configured.
- Last resort: paste any public image URL.
- 8 MB limit, images only.

---

## 10. Reports

1. Range selected (week / month / custom).
2. Pull `scores_daily`, `activities`, `savings` and dreams.
3. Compute trajectory per dream:
   - velocity = on-track actions in range ÷ weeks
   - estimate = remaining progress ÷ velocity
4. AI writes headline, trend, wins, waste, money line, one fix (zod-validated).
5. Deterministic fallback if AI fails.
6. Stored as markdown; PDF generated **on demand** with `pdf-lib` (no blob storage needed).
7. Optional Resend email with the PDF attached.
8. GitHub Actions triggers weekly (Monday) and monthly (1st) via `/api/cron/reports`.

---

## 11. MCP server

- Endpoint: `/api/mcp` (Streamable HTTP, stateless).
- Auth: `Authorization: Bearer <MCP_AUTH_TOKEN>`.
- 29 tools: dreams, check-in, logs, activities, scores, savings, reports, profile, dashboard.
- Same `core/` functions as the website and bot — no duplicated logic.
- A cloud agent can poll `get_pending_checkin`, ask you in its own chat, then call `answer_checkin`.

---

## 12. Scheduling

| Job | Trigger | Endpoint |
|---|---|---|
| Daily ask + re-ask | hourly (GitHub Actions) | `/api/cron/check-ins` |
| Reports | Mon 07:00, 1st 07:30 | `/api/cron/reports` |

Both require `x-cron-secret`. The route decides if anything is actually due.

---

## 13. Deployment

- **Vercel** builds from GitHub (`pnpm build`).
- Authenticated pages are `force-dynamic` so the build never needs a database.
- **Supabase** Postgres; migrations are generated from entities and run with `pnpm db:migrate`.
- Env vars are Vercel production secrets; `.env` never committed.
- Custom domain: Cloudflare `CNAME` → `cname.vercel-dns.com` (DNS only).

---

## 14. Decisions and why (short ADRs)

| Decision | Why |
|---|---|
| PIN instead of email/password | single user, no email dependency, fast login |
| Postgres only (no SQLite) | one schema, real `timestamptz`/enums, production parity |
| Groq first, OpenRouter second | free models were rate-limited; Groq was reliable |
| Deterministic score anchors AI | model invented good scores for empty days |
| Append on Telegram, replace on web | multiple messages should accumulate; “re-log” should reset |
| Reject greetings | “hello” is not a daily update and must not be scored |
| Date-specific ask | day counters confused the user and drifted |
| PDF on demand | avoids storing binaries; report markdown is the source |
| Cloudinary over repo uploads | serverless filesystem is ephemeral |
| No web push (yet) | Telegram is the reliable channel; PWA is offline shell only |

---

## 15. Security

- Secrets only in env; `.env*` gitignored; AI keys encrypted in DB.
- All user routes require the session cookie; machine routes require secrets.
- No RLS: the app uses a direct Postgres connection, single owner, server-only.
- Upload endpoint is auth-gated; file type and size validated.
- Private: `robots: noindex`.

---

## 16. Failure modes

| Failure | Behaviour |
|---|---|
| No AI key / provider down | heuristic parser + deterministic score |
| Whisper rejects audio | bot asks for text |
| Cloudinary down | upload error, URL paste still works |
| Resend missing | report generated, email skipped |
| Cron missed | no data loss; next run still sees unanswered log |
| DB unreachable | health check returns 503; no partial writes |

---

## 17. Known limits

- Follow-up questions are generated but not rendered as a thread yet.
- Web push is not implemented.
- Report trajectory is an intentional estimate.
- Single user by design; no multi-tenant isolation.
