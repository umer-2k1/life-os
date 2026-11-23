# 11 · API & Route Contract

Next.js App Router. Prefer **Server Actions** for UI mutations and **Route Handlers** (`app/api/*`) for bot/MCP/cron/webhooks. Every handler validates input with zod and calls `core/`. All user routes require the authenticated single user; machine routes require a shared secret.

Conventions: JSON in/out; dates ISO `YYYY-MM-DD`; money as integer minor units + `currency`; errors `{ error: { code, message } }` with proper HTTP status.

---

## Auth
- `POST /api/auth/login` `{ password }` → sets session cookie. Single-user; password hashed via `AUTH_SECRET`. (Or use Supabase Auth email magic link — pick one, document it.)
- `POST /api/auth/logout` → clears session.
- Middleware gates all app routes + user API routes.

## Dreams
- `GET  /api/dreams` → `Dream[]` (summary). Query: `status`, `priority`.
- `POST /api/dreams` `CreateDream` → `Dream`.
- `GET  /api/dreams/:id` → `DreamDetail` (emotion, images, milestones, savings).
- `PATCH /api/dreams/:id` `Partial<Dream>` → `Dream`.
- `DELETE /api/dreams/:id` → `{ ok }`.
- `POST /api/dreams/:id/images` (multipart) → uploads to Storage, returns `DreamImage`.
- `POST /api/dreams/:id/milestones` `{ title }` → `Milestone`.
- `PATCH /api/milestones/:id` `{ done }` → `Milestone`.
- `PUT  /api/dreams/:id/emotion` `{ story?, emotional_reason?, feeling?, voice_note_url? }` → `DreamEmotion`.
- `GET  /api/dreams/:id/next-action` → `{ action: string }` (AI).

## Check-in / daily log (channel-agnostic)
- `GET  /api/checkin/pending` → `{ open: boolean, question?: string, date }`.
- `POST /api/checkin/answer` `{ text, date?, input_kind }` → runs pipeline → `DailyLog` (score, bullets, activities, next). **Same handler the bot & MCP call** (`core.logDay`).
- `GET  /api/logs/:date` → `DailyLog` + `Activity[]`.
- `GET  /api/checkin/followups?date=` → `{ questions: string[] }`.
- `POST /api/checkin/followups` `{ date, text }` → updates log.

## Activities (Kanban)
- `GET  /api/activities?from=&to=` → `Activity[]`.
- `POST /api/activities` `{ date, text, dream_id? }` → scored `Activity`.
- `PATCH /api/activities/:id` `{ column?, dream_id? }` → `Activity`.

## Savings
- `GET  /api/dreams/:id/savings` → `Savings` + `SavingsEntry[]`.
- `POST /api/dreams/:id/savings/entry` `{ amount, note? }` → updates total.
- `PUT  /api/dreams/:id/savings/target` `{ target_amount, currency }` → `Savings`.

## Scores / heatmap
- `GET  /api/scores?from=&to=` → `{ day, score, points }[]`.
- `GET  /api/streak` → `{ current, best }`.

## Reports
- `POST /api/reports/generate` `{ kind, range_start?, range_end?, email? }` → `Report` (markdown + pdf_url).
- `GET  /api/reports` → `Report[]`.
- `GET  /api/reports/:id` → `Report`.

## Profile / settings
- `GET  /api/profile` → `Profile`.
- `PATCH /api/profile` `{ north_star_amount?, north_star_label?, identity_line?, motto?, timezone? }`.
- `GET/PUT /api/settings/ai` → provider order, selected model, keys (write-only; never return raw keys).
- `GET  /api/settings/models` → live free-model list (proxied from OpenRouter `/models`, filtered free).
- `GET/PUT /api/settings/notifications` → ask time, re-ask gap, quiet hours, channels.

## Machine endpoints (shared secret / signed)
- `POST /api/cron/check-ins` (hourly, GH Actions) — header `x-cron-secret`. Evaluates who's due → sends Telegram ask/re-ask per the state machine in `04`.
- `POST /api/cron/reports` (Mon + 1st) — generates + emails weekly/monthly.
- `POST /api/telegram` — Telegram webhook (verify `TELEGRAM_WEBHOOK_SECRET`). Handles text + voice (download → Whisper → `core.logDay`). `/start` links chat_id.
- `ALL  /api/mcp` — remote MCP server endpoint (bearer `MCP_AUTH_TOKEN`). Tools in `05`.

---

## Core types (zod + TS) — illustrative
```ts
Dream = { id, title, cover_image_url?, priority:"low"|"medium"|"high",
  importance_note?, target_date?, money_needed?, progress:number, status, last_touched_at }
DailyLog = { id, log_date, raw_input, input_kind:"voice"|"text"|"mcp"|"web",
  score:number, summary_bullets:string[], trajectory_note?, answered:boolean }
Activity = { id, daily_log_id, dream_id?, text, relevance:"on_track"|"neutral"|"waste",
  score_delta:number, time_cost_days:number, suggestion?, column }
```
See [`03-data-model.md`](03-data-model.md) and [`reference/entities.ts`](reference/entities.ts) (TypeORM) for the full set.
