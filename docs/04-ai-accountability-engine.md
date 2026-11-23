# 04 · AI & Accountability Engine

The heart of behavior change. The bot that comes to me.

---

## Daily loop (Telegram)

1. **12:00 AM** (my timezone): bot sends the daily ask.
   - Short, human, no fluff. e.g. *"Day 41. What did you do today toward the money / the dreams? Voice or text."*
2. I reply **voice or text** (voice is default — I'm lazy).
   - Voice → **Groq Whisper** → transcript.
3. AI parses the update into **activities** and asks **follow-ups only if unclear**.
   - e.g. "You said 'worked on the app' — which dream? how long?"
4. AI **scores** each activity (relevance) + computes **daily score (0–100)**.
5. Stores `daily_log`, `activities`, updates streak/heatmap/points.
6. Replies with a **short recap** (bullets) + tomorrow's **one next action**.

## Re-ask logic (the nagging)
- Ping at 12:00 AM. If no answer:
  - re-ask every **~6h** (next ~6:00 AM), within allowed windows.
- Once I answer → **stop** until next day 12:00 AM.
- Example: asked 12 AM, I ignore → asked again 6 AM → I answer → silent until next 12 AM.
- Hourly **GitHub Actions cron** evaluates who's due (state in `daily_logs`). Respects `quiet_hours` and `reask_gap_hours`.
- Don't overload the server — hourly check, 6h gap, one user.

## Scoring model

**Per-activity relevance** (vs my goals):
- `on_track` 🟢 — directly advances a dream/money (e.g. "reached out to 5 recruiters", "shipped a feature to pitch", "saved ₨X").
- `neutral` 🟡 — maintenance (sleep, admin, learning loosely related).
- `waste` 🔴 — irrelevant to goals (e.g. "3h GTA 6 videos", "streamed all evening").

**Daily score (0–100)** — weighted:
- + on-track volume & difficulty
- + streak / consistency
- − waste (and waste is **priced**, see below)
- clamp 0–100, store in `scores_daily`.

**Pricing waste in time** (the sleepless trigger):
- For waste activities, estimate **days added to the nearest/most-relevant dream's timeline** from the hours lost vs. required pace.
- Surface as: **"3h YouTube ≈ +2 days to Dream Car."**
- This is a *motivational estimate*, labeled as such — not false precision. Tunable formula; transparent in docs.

## Output style (hard rule)
- **Bullets / keywords only.** Never paragraphs.
- Red for waste, green for on-track — visually and in text tags.
- Max ~5 bullets per recap.

## Example recap (format)
```
Day 41 · Score 72/100 · 🔥 6-day streak
🟢 Reached out to 5 recruiters → Career/Money
🟢 Saved ₨15k → Dream Car (62% → 64%)
🔴 3h YouTube → ≈ +2 days to Dream Car
Next: send the pitch deck to 2 of the 5 recruiters.
```

---

## AI provider routing (free-first)

**Order (configurable in Settings):**
1. **OpenRouter** — free models (default)
2. **Groq** — fast free fallback
3. **Grok (xAI)** — optional user key
4. **DeepSeek** — optional user key

**Rules:**
- No model selected → auto-pick a free model.
- Rate-limit / error → auto-fall to next provider/model.
- Model catalog pulled live from **OpenRouter `/api/v1/models`** → Settings picker shows current free models (filter `pricing == 0`).
- Keys entered in Settings, stored **encrypted** (`ai_settings.keys`).
- Routing via **LiteLLM** (uniform interface) or LangChain with fallbacks.

**Tasks that use AI:**
- Parse daily update → activities (structured output / JSON).
- Score relevance + price waste.
- Generate recap + next action.
- Generate weekly/monthly reports.
- Resurface emotional anchors ("why you started").
- Follow-up question generation.

**Prompt design notes:**
- Give the model my **dreams + priorities + North Star** as context so scoring is personal.
- Force **structured JSON** for activities/scores (validate with zod).
- Enforce brevity in the system prompt ("bullets only, no paragraphs, ≤5 bullets").
- Keep token use low (one user, free models) — summarize history, don't resend everything.

## Voice handling
- Telegram voice message → download OGG → **Groq Whisper** transcription → treat as `raw_input`.
- Fallback: if Whisper unavailable, ask me to type.

## Channels
- **Telegram** = primary, reliable (voice+text, mobile push built in).
- **Web push / PWA** = secondary reminders.
- **Email** = reports only (Resend).
