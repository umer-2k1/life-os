# 10 · UI Build Brief (developer-ready)

Very detailed, screen-by-screen instructions to build the real UI. Pair with [`07-design-system.md`](07-design-system.md) (tokens, type, color) and the interactive demo (dark-luxury reference for feel, layout, and motion). This brief defines **what to build**, **states**, **interactions**, and **data bindings** — not code.

> ✅ **Reference demo (LOCKED):** [`reference/ui-gold-luxury-demo.html`](reference/ui-gold-luxury-demo.html) — open it in a browser. It's the approved visual source of truth: match its *feel* (dark luxury, gold restraint, Fraunces display + Inter UI, calm motion), not its sample data. See [`reference/README.md`](reference/README.md).

---

## 0. Global shell

- **App frame**: sticky top header + tab nav + a thin gold "motto" strip pinned under the header.
- **Header**: wordmark ("The Life I'm Building") + gold `L` mark, live date/time (right, hidden on small phones).
- **Nav tabs**: Dashboard · Dreams · Activity · Reports. Active = gold-soft text on raised surface. Horizontal-scroll on phone.
- **Motto strip** (always visible): *"Make a shit ton of money. Nobody cares about it."* — Fraunces italic, gold-soft, a glowing gold dot. Non-negotiable, every screen.
- **Routing**: tab state in `#hash` (`#dash`, `#dreams`, `#activity`, `#reports`).
- **Typography**: Fraunces (display/emotional headers, numbers-as-feelings), Inter (all UI). `tabular-nums` on every figure.
- **Motion budget**: panel fade+rise on switch (~300ms), hover lift on cards, ring/bar count-ups on first view. Respect `prefers-reduced-motion`. No heavy gradients, no parallax overload.

---

## 1. Dashboard (trophy room)

Order top→bottom (summary before detail):

1. **North Star card** (hero-left): target number (Fraunces, large, gold-soft) + label + **identity line** ("I'm becoming someone who…"). Soft gold radial glow in the corner.
2. **Today card** (hero-right):
   - **Score dial** (SVG ring, 0–100, gold gradient, number in center).
   - **Streak chip** (🔥 N-day, amber).
   - **Level + points bar** (progress to next level).
3. **Decay alert** (conditional): red-bordered banner — "N days since you touched {Dream}". Only shows when any active dream's `last_touched_at` exceeds threshold. Sort by most-neglected.
4. **Two-up row**:
   - **Today's 3 Priorities**: checkable rows, each tagged with the dream it serves. Checking strikes through + updates score. (Priorities are AI-suggested, user can confirm/swap.)
   - **Last check-in recap**: ≤5 bullets, green/amber/red tags, waste priced in **days added** (red). Ends with the single **Next action** in a dashed gold box.
5. **Consistency heatmap**: GitHub-style, 20 weeks, gold intensity scale, horizontal scroll on phone, legend beneath.
6. **"Why you started"**: rotating emotional anchor pulled from a dream — its cover + the `emotional_reason` in Fraunces italic. Changes daily.

**Data bindings**: `profiles` (north star, identity, motto) · `scores_daily` + today's `daily_logs` (dial, streak, recap) · `dreams` (decay, why-you-started) · `activities` (recap bullets, waste pricing).

**Empty states**: no check-in yet today → dial shows "—" with "Your bot will ask at 12 AM · or log now". No dreams → prompt to add the first dream.

---

## 2. Dreams

- **Grid** of dream cards, `auto-fill minmax(230px,1fr)`.
- **Dream card**:
  - Cover (16:10). Real photo when uploaded; **gradient + large glyph** fallback (per-dream color).
  - Priority chip (top-left, color by level: high=red, med=amber, low=muted).
  - **Progress ring** (bottom-right of cover).
  - Title (Fraunces), target date, **"days since touched"** (turns red + ⚠ when stale).
  - Hover: lift + gold border glow.
- **Tap → Dream detail** (modal sheet; bottom-sheet on phone, centered dialog on desktop):
  - Hero (cover + glyph), close button.
  - Priority, title.
  - **The why** (emotional anchor): story + `emotional_reason` in Fraunces italic, left gold rule; feeling line. Optional voice-note player.
  - **KV grid**: Target · Progress · Need · Saved.
  - **Savings bar** (remaining to go).
  - **Milestones** checklist (done = green dot + strikethrough).
  - **Next action** (dashed gold box).
  - Gallery (multiple images) when present.
  - Edit / delete actions (owner only).
- **Add dream**: form or via bot/MCP (`create_dream`). Minimum: title + priority; everything else optional and fillable later.

**Data bindings**: `dreams`, `dream_emotions`, `dream_images`, `milestones`, `savings`.

---

## 3. Activity (Kanban + scoring)

- **Board**: 4 columns — `Today · Doing · Done · Wasted`. Horizontal scroll on phone (~78vw columns).
- **Activity card**:
  - Left severity stripe: green (on-track) / amber (neutral) / red (waste).
  - Text (short), served-dream, **points delta** (green + / red "+N days" for waste).
  - **Suggestion** line (dashed divider): short, concrete, keyword-y — harsh when earned.
- **Waste column** header in red. Waste cards show **days added to timeline**, not just a tag.
- Cards are parsed from the daily check-in (AI) — user rarely types here. Drag between columns updates `activities.column`.
- **Log bar** (bottom): "You never fill a form — the bot asks you. Reply by voice/text on Telegram, in Claude (MCP), or here." + a record-voice button.

**Data bindings**: `activities` grouped by `column`, joined to `dreams`; `daily_logs` for the day.

**Filters**: date picker + range (calendar) to view any day/period's board.

---

## 4. Reports

- **Header**: "Weekly Report" + date range + trend arrow (avg score vs last period).
- **Range controls**: This week · This month · Custom range · **Download PDF**.
- **Trajectory verdict** (gold-bordered, the centerpiece): per dream, projected time-to-achieve **now vs last period** ("~3.4 yrs · was 3.6"). Stalled items flagged.
- **Two-up**: **Wins** (green, point-weighted bullets) · **Waste** (red, total days added) + a single **"Fix one thing"** box.
- Footer: "Emailed every Monday via Resend · PDF available · any date range from Claude or the bot."

**Data bindings**: aggregated `scores_daily`, `activities`, `savings_entries` over range; `reports` row for stored/emailed copies.

---

## 5. Cross-cutting rules

- **Brevity law**: bullets/keywords only, never paragraphs, ≤5 bullets per block. Enforced in UI copy *and* AI output.
- **Color = meaning**: green on-track, amber neutral, **red = waste/decay/danger** (deliberate anxiety trigger). Never red/green as the only signal — pair with icon/label.
- **Numbers are emotional**: scores, money, trajectory in Fraunces, large, tabular.
- **Loss framing everywhere**: streaks that can break, decay in red, timelines that slip. Make inaction *visible*.
- **Responsive**: mobile-first; grids stack, boards scroll, sheets become bottom-sheets. 16px+ gutters, no horizontal body scroll.
- **A11y**: focus-visible rings, dialog `aria-modal`, Esc/scrim close, AA contrast on dark, reduced-motion.
- **Settings** (separate screen, see `04`): AI provider order + keys, model picker (live from OpenRouter), check-in time + re-ask gap + quiet hours, channels (Telegram/web/email), Telegram link.

---

## 6. Build order for the UI (maps to roadmap)
1. Shell + tokens + nav + motto (M0/M5).
2. Dreams grid + detail + emotional anchor (M1).
3. Dashboard (M5) — after dreams + scoring exist.
4. Activity board (M3).
5. Reports (M6).
6. Settings (M2, alongside bot).

Keep every screen honest, calm, and a little anxious-making. Luxury is restraint; pressure is the red.
