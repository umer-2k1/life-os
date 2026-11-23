# 01 · Product Spec

Every feature. Grouped. Bullet-first.

---

## 1. Dreams (the heart)

**Dream card (grid view)**
- Big cover photo, title, priority badge, progress ring, target date, days-since-touched.
- Decays visually: neglected dreams fade / turn red over time.

**Dream page (dedicated, per dream)**
- **Gallery**: multiple photos / inspiration images.
- **The Why (emotional anchor — first-class):**
  - Personal story — why I want it.
  - The *emotional reason* (raw, unfiltered — a letter to myself).
  - A feeling/mood + optional voice note of me explaining it.
  - This block is resurfaced by the bot/dashboard on purpose to re-trigger the spark.
- **Priority** (low / medium / high) + **importance** note.
- **Money needed** (links to the savings tracker).
- **Target date** + auto-computed **projected date** (from current pace).
- **Progress** (0–100%) + **milestones** (checklist with dates).
- **One next action** (AI-suggested, always present).
- **Notes & reflections** (free, voice or text).
- Unlimited dreams; add/edit/delete anytime.

**Initial dreams (seed)**
- Dream Car · Umrah · PlayStation 5 · Gaming PC · Laptop upgrade · Financial growth · Personal development · Career & skills.

---

## 2. Dashboard (home / trophy room)

Shown on open:
- Welcome + **live date & time**.
- **"Make a shit ton of money. Nobody cares about it."** (permanent).
- **North Star number** + identity line.
- Top dreams with photos + progress.
- Active goals + progress bars.
- **Today's 3 priorities** (AI-selected or confirmed by me).
- **Today's score** (0–100) + streak.
- **Consistency heatmap** (GitHub-style).
- **Decay alerts**: "14 days since you touched Umrah" in red.
- "Why you started" — a rotating emotional anchor pulled from a dream.

---

## 3. Accountability (AI, not forms)

Full detail in [`04-ai-accountability-engine.md`](04-ai-accountability-engine.md). Summary:
- Bot DMs me daily (Telegram), **voice note or text**.
- Asks for my daily update; **follow-up questions** when unclear.
- **Re-ask logic**: first ping 12:00 AM; no reply → re-ask every ~6h (next at 6:00 AM). Once I answer, it stops until next day 12:00 AM.
- AI **scores each activity** for relevance to my goals → green (on-track) / amber / **red (waste)**.
- Prices waste in **days added to my timeline**.
- Produces the daily 0–100 score.

---

## 4. Daily activity tracking (Kanban + heatmap + points)

- **Kanban board** (Trello/ClickUp feel): columns e.g. `Today · Doing · Done · Wasted`.
- Each **activity card**, when opened, shows:
  - What I did (short).
  - **Relevance score** + which goal it serves.
  - **Concrete, short suggestion** (bullets/keywords, no paragraphs).
  - Green/amber/red tag.
- **GitHub-style heatmap** of daily scores.
- **Points + levels** (gamification): earn points for on-track actions, streaks, milestones; lose/stall on waste.
- **Calendar + date-range filter** across all activity.

---

## 5. Financial goals & savings

- Per-dream tracker: **target amount**, **saved so far**, **remaining**, **% complete**.
- Visual progress + projected "fully saved" date at current pace.
- All dream money rolls up to the **North Star number**.

---

## 6. Daily reflection

- Short evening prompt (voice or text):
  - What did I accomplish? (did I move closer?)
  - What did I waste time on? → **priced in days added to a dream**.
  - What do I improve tomorrow?
- Builds self-awareness; feeds the score and reports.
- Kept short on purpose. Bullets only.

---

## 7. Reports & intelligence

Full detail in [`06-reports.md`](06-reports.md). Summary:
- **Weekly** + **monthly** reports: achievements, waste, trajectory verdict, what to improve, where I'm heading.
- **Downloadable** (PDF) + **emailed** (Resend).
- **Date-range** custom reports via calendar.
- "At this pace: Dream Car in ~3.4 yrs (was 3.6)" — trajectory movement.

---

## 8. MCP server (drive it without the UI)

Full detail in [`05-mcp-server.md`](05-mcp-server.md). Summary:
- Every entity exposed as MCP tools: dreams, daily logs, scores, savings, reports, priorities.
- From any MCP client (Claude, etc.): "add a dream", "log my day", "show this week's score", "what's my next action for Umrah".
- Same core logic the bot and website use — no duplication.

---

## 9. Platform & practical requirements

- **Private**, single-user, password-protected (Supabase Auth).
- **Syncs** across phone + laptop (cloud Postgres).
- **Persistent** storage; **photo upload/management** (Supabase Storage).
- **Edit/delete** everything.
- **Responsive** (phone + desktop).
- **PWA** install + web push where supported; **Telegram** is the always-reliable channel.
- **Backups** of personal data (Supabase export + scheduled dump).

---

## Non-goals (what this is NOT)
- Not a team/project-management tool. No corporate feel.
- Not a heavy journaling chore.
- Not dependent on me opening a dashboard to function.
- Not paragraph-heavy. Ever.
