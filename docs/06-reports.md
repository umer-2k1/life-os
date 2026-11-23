# 06 · Reports & Intelligence

Pro-level, not noob-level. Learns my goals. Tells me where I'm heading.

## Types
- **Weekly** — every Monday, previous 7 days.
- **Monthly** — 1st of month, previous month.
- **Custom** — any date range (calendar picker or MCP/`generate_report`).

## What each report contains (bullets, no walls of text)
- **Headline**: week/month score avg + trend arrow.
- **Trajectory verdict**: *"At this pace: Dream Car ~3.4 yrs (was 3.6). Umrah ~1.2 yrs."* — the number that must move.
- **Wins** 🟢 — top on-track actions, grouped by dream.
- **Waste** 🔴 — biggest time sinks + **total days added to timelines**.
- **Money**: saved this period, % movement per dream, vs North Star.
- **Consistency**: days logged, streak, heatmap snapshot.
- **One thing to fix** — the single highest-leverage change for next period.
- **Next period's focus** — 1–3 priorities.

## Delivery
- **Emailed** via **Resend** (HTML, dark-luxury styled).
- **Downloadable PDF** — generated (e.g. `@react-pdf` or HTML→PDF), stored in **Supabase Storage**, linked in-app.
- **In-app** reports page with date-range filter + history.

## Generation
- Triggered by **GitHub Actions cron** (Mon + 1st) → `/api/cron/reports`.
- Pulls `daily_logs`, `activities`, `scores_daily`, `savings_entries` for the range.
- AI composes the markdown (brevity-enforced), compute trajectory from pace.
- Save `reports` row + PDF + email.

## Trajectory math (transparent)
- For each money dream: `remaining / recent_saving_rate` → projected date.
- For effort dreams: progress slope from recent scores → projected completion.
- Compare to last period → show movement (the motivating delta).
- Labeled as estimate; tunable.

## Tone
- Direct, honest, a little harsh when earned.
- Celebrate real wins; make waste sting.
- Keywords and bullets. Always.
