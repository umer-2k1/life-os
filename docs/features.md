# Features

> What the system does, where it lives, and what is still missing.
> Specs: [`01-product-spec.md`](01-product-spec.md), [`05-mcp-server.md`](05-mcp-server.md), [`06-reports.md`](06-reports.md).

Status: ✅ live · 🟡 needs a key/setup · ◐ partial · ⬜ not built

---

## 1. At a glance

| Area | Status | Where |
|---|---|---|
| PIN login | ✅ | `/login` |
| Dream CRUD + gallery | ✅ | `/dreams` |
| Emotional anchor (“the why”) | ✅ | dream sheet |
| Milestones | ✅ | dream sheet |
| Savings tracker | ✅ | dream sheet |
| Dashboard | ✅ | `/` |
| Daily check-in (Telegram / web / MCP) | ✅ | bot, `/activity`, `/api/mcp` |
| Voice → text | ✅ | Groq Whisper |
| AI parsing + scoring | ✅ | `core/ai`, `core/logs` |
| Waste priced in days | ✅ | activities |
| Kanban board | ✅ | `/activity` |
| Heatmap + streak + points | ✅ | dashboard |
| Decay alerts | ✅ | dashboard |
| Reports + PDF | ✅ | `/reports` |
| Emailed reports | 🟡 | Resend + `OWNER_EMAIL` |
| Remote MCP server | ✅ | `/api/mcp` |
| PWA install + offline shell | ✅ | manifest + SW |
| Web push | ⬜ | — |
| Follow-up question thread | ◐ | generated, not rendered |
| Automated tests | ⬜ | — |

---

## 2. Authentication

- Single user, **6-digit PIN**.
- Default `252525` on first run; change in **Settings → Security**.
- scrypt hash in Postgres, 30-day httpOnly session cookie.
- 8 wrong attempts / 10 min → temporary lockout.
- Every app page and user API is gated by `src/proxy.ts`.
- Machine endpoints use their own secrets: `x-cron-secret`, Telegram webhook secret, MCP bearer token.

---

## 3. Dreams

### Create / edit / delete
Title, glyph, priority (high/medium/low), target date, money needed, importance note, cover URL, progress, status (active/achieved/paused).
Delete cascades the why, gallery, milestones and savings.

### The why (emotional anchor)
Per dream:
- `story` — why you want it
- `emotional_reason` — raw letter to yourself
- `feeling` — one word
- optional voice-note URL

The dashboard resurfaces one dream’s raw reason daily (“Why you started”).

### Gallery
- Upload via Cloudinary (`POST /api/dreams/:id/images`) or paste a URL.
- 8 MB limit, images only.
- Remove individual images.

### Milestones
- Add, complete, reopen, delete.
- Completing one touches the dream (resets decay) and counts as progress.

### Next action
- Heuristic: first open milestone → savings gap → “30 focused minutes”.
- AI version available via `GET /api/dreams/:id/next-action` and MCP `next_action`.

### Decay
- High priority: amber after 3 untouched days, red at 6.
- Medium: 7 / 14. Low: 14 / 28.
- Dashboard shows the worst offender in a red banner.

### Savings
- One tracker per money dream: target, saved, remaining, %.
- Add entries (positive or negative) with a note; history is kept.
- All active dreams roll up to the North Star card on the dashboard.

---

## 4. Dashboard

Top to bottom:
1. **North Star** — amount, label, identity line, glow.
2. **Today** — score dial, streak chip, level + points bar.
3. **Decay banner** — conditional, worst dream first.
4. **Today’s 3 priorities** — suggested from high-priority dreams; add or complete.
5. **Last check-in recap** — ≤5 tagged bullets, waste priced in days, one “Next”.
6. **Consistency heatmap** — 20 weeks, gold intensity.
7. **Why you started** — rotating emotional anchor.
8. **Dreams strip** — top goals with progress and “Nd ago”.

Empty states: no log → dial shows `—`; no dreams → prompt to add the first.

---

## 5. Daily check-in

### Channels
| Channel | Ask | Answer |
|---|---|---|
| Telegram | ✅ push at ask time + re-asks | ✅ voice or text |
| Web | ✅ `/activity` composer | ✅ text |
| MCP | ✅ `get_pending_checkin` (pull) | ✅ `answer_checkin` |
| Email | ⬜ | ⬜ |

First answer on any channel sets `answered=true` and stops all re-asks until the next day.

### Ask rules
- The ask reviews the **day that ended**:
  - ask time before noon → yesterday
  - ask time in the evening → today
- Date-specific question, **no day counter**:
  `"Report for Wednesday, November 25 — what did you do that day toward the money / the dreams? Voice or text."`
- Replies are logged to that date (Telegram, API, MCP `answer_checkin`).
- Asked at `daily_ask_time` (default 00:00 local).
- Re-ask every `reask_gap_hours` (default 6).
- Quiet hours suppress re-asks only, not the first ask.
- Hourly GitHub Actions cron evaluates whether anything is due.

### Voice
- Telegram voice → `getFile` → Groq `whisper-large-v3`.
- Uploaded as `voice.ogg` because Groq rejects Telegram’s `.oga`.
- Failure → bot asks for text.

### Non-updates
“hello”, “test”, “first message” are rejected: no score, no activity, the bot asks for a real update.

### Multiple messages
Telegram/MCP **append** to the day. Web “Re-log day” **replaces** the day.

---

## 6. Scoring

Per activity:
- 🟢 `on_track` — moves a dream or income
- 🟡 `neutral` — maintenance
- 🔴 `waste` — irrelevant; priced as **days added** (`hours × 0.7`)

Daily score:
- deterministic anchor 70% + AI 30%
- 0 on-track → max 30 (or 22 with waste)
- waste ≥ 2 days → max 65
- high-priority / remote-job work → **+5 each, max +15**
- points: +12 on-track, +3 neutral, −8 waste, +5 for answering
- levels: 100, 250, 450, 700, 1000…
- streak: consecutive answered days

Everything is stored in `daily_logs`, `activities`, `scores_daily`.

---

## 7. Activity board

- Dated board: `Today · Doing · Done · Wasted`.
- Navigate day by day or jump with a date picker.
- Cards: severity stripe, relevance label, points or `+N days`, dream, short suggestion.
- Move by drag on desktop or arrows on touch.
- Log composer under the board (fallback when the bot isn’t used).
- Recap card for the selected day.

---

## 8. Reports

- **Weekly**, **monthly**, **custom range**.
- Trajectory per dream: estimated time to finish now vs previous period.
- Wins, waste (total days), money line, one highest-leverage fix.
- Stored markdown + narrative JSON.
- PDF downloaded on demand (`pdf-lib`).
- Emailed with the PDF when Resend + `OWNER_EMAIL` are set.
- History list.
- Cron: Monday weekly, 1st monthly.

---

## 9. Settings

- **Identity**: display name, North Star amount/label, identity line, motto, timezone, currency.
- **Security**: change PIN (OTP fields), sign out.
- **AI**: masked keys per provider, model picker from OpenRouter free models, encrypted at rest.
- **Notifications**: ask time, re-ask gap, quiet hours, channels, push toggle (stored; web push not built).
- **Integrations**: AI, Cloudinary, Telegram, Resend, MCP status.
- **Telegram**: register webhook button + `/start` hint.

---

## 10. MCP server

Endpoint: `POST /api/mcp` · `Authorization: Bearer <MCP_AUTH_TOKEN>`.

29 tools:
- Dreams: `list_dreams`, `get_dream`, `create_dream`, `update_dream`, `delete_dream`, `add_milestone`, `complete_milestone`, `set_emotional_anchor`, `next_action`
- Check-in: `get_pending_checkin`, `answer_checkin`, `log_day`, `get_day`, `add_reflection`
- Board: `add_activity`, `move_activity`, `get_activities`
- Scores: `get_score`, `get_heatmap`, `get_streak`
- Savings: `get_savings`, `add_saving`, `set_savings_target`
- Reports: `generate_report`, `list_reports`, `get_report`
- Profile: `get_profile`, `update_profile`, `dashboard`

Same core logic as the UI and bot.

---

## 11. PWA

- `manifest.webmanifest` — name, gold icons, standalone, dark theme.
- Service worker caches the offline shell and static assets **only**; private HTML is never cached.
- Install from the browser: “Add to Home Screen”.
- Web push: not implemented.

---

## 12. API surface

User routes (session cookie):
- `POST /api/auth/login`
- `GET/POST /api/dreams`, `GET/PATCH/DELETE /api/dreams/:id`
- `POST /api/dreams/:id/images`, `POST /api/dreams/:id/milestones`
- `PATCH/DELETE /api/milestones/:id`
- `PUT /api/dreams/:id/emotion`, `GET /api/dreams/:id/next-action`
- `GET /api/dreams/:id/savings`, `POST .../savings/entry`, `PUT .../savings/target`
- `GET /api/checkin/pending`, `POST /api/checkin/answer`, `GET /api/checkin/followups`
- `GET /api/logs/:date`
- `GET/POST /api/activities`, `PATCH/DELETE /api/activities/:id`
- `GET /api/scores`, `GET /api/streak`
- `GET/PATCH /api/profile`
- `GET/PUT /api/settings/ai`, `GET /api/settings/models`, `GET/PUT /api/settings/notifications`
- `POST /api/reports/generate`, `GET /api/reports`, `GET /api/reports/:id`, `GET /api/reports/:id/pdf`
- `POST /api/upload`

Machine routes (secret):
- `POST /api/cron/check-ins`, `POST /api/cron/reports`
- `POST /api/telegram`, `GET/POST /api/telegram/setup`
- `ALL /api/mcp`

Public:
- `GET /api/health`

---

## 13. Integrations

| Integration | Used for | Needed |
|---|---|---|
| Supabase Postgres | all data | ✅ |
| Groq | AI + Whisper | ✅ |
| OpenRouter | AI fallback | optional |
| xAI / DeepSeek | AI fallback | optional |
| Telegram | daily loop | ✅ for the bot |
| Cloudinary | image uploads | optional (URL paste works) |
| Resend | report email | optional |
| GitHub Actions | cron | optional |

---

## 14. Not built / partial

- Web push notifications.
- Follow-up question thread in the UI.
- Email inbound replies.
- Multi-user / teams.
- Automated test suite.
- RLS (single owner, direct server connection).
- Native mobile app (PWA only).
