# 08 · Roadmap / Milestones

Ship the **loop** first (bot + scoring). The pretty dashboard comes after — because the bot is the product.

---

## M0 · Foundations
- [ ] Next.js + TS + Tailwind + shadcn scaffold
- [ ] Supabase project: Postgres + Auth (single user) + Storage
- [ ] Drizzle schema + migrations (from `03-data-model.md`)
- [ ] Env + secrets plumbing; deploy skeleton to Vercel + custom domain
- [ ] `core/` service layer shape

## M1 · Dreams + emotional anchor (the heart)
- [ ] Dreams CRUD + images (Supabase Storage)
- [ ] Emotional anchor fields (story, emotional_reason, feeling, voice note)
- [ ] Milestones, priority, target date, progress
- [ ] Seed my 8 initial dreams
- [ ] Dream page + grid UI (dark luxury)

## M2 · Accountability loop (bot = product)
- [ ] Telegram bot (grammY), link my chat_id
- [ ] Daily ask at 12 AM + voice/text intake
- [ ] Groq Whisper voice→text
- [ ] AI provider routing (OpenRouter→Groq→optional keys) + Settings
- [ ] Parse update → activities, follow-up questions
- [ ] Scoring + waste-pricing + daily recap
- [ ] GitHub Actions hourly cron + re-ask state machine

## M3 · Tracking & gamification
- [ ] Kanban board + activity cards (scores, suggestions)
- [ ] GitHub-style heatmap
- [ ] Points + levels + streaks
- [ ] Calendar + date-range filters
- [ ] Decay alerts on neglected dreams

## M4 · Money + reflection
- [ ] Savings trackers (target/saved/remaining/%) + history
- [ ] North Star rollup
- [ ] Daily reflection (voice/text), priced waste

## M5 · Dashboard (trophy room)
- [ ] Home: welcome, live time, motto, North Star, top dreams, today's score + priorities, heatmap, "why you started"
- [ ] Full dark-luxury pass + motion

## M6 · Reports & intelligence
- [ ] Weekly + monthly + custom reports
- [ ] Trajectory verdict math
- [ ] Resend email + PDF export (Supabase Storage)
- [ ] Reports history page

## M7 · MCP server
- [ ] Remote MCP endpoint `/api/mcp` + auth
- [ ] Tools from `05-mcp-server.md` wired to `core/`
- [ ] Test from an MCP client (Claude)

## M8 · PWA + notifications + backups
- [ ] PWA manifest + service worker + install
- [ ] Web push (where supported) + notification prefs UI
- [ ] Scheduled Supabase backup/export

## M9 · Polish
- [ ] Reduced-motion, a11y, mobile pass
- [ ] Empty/error states, onboarding
- [ ] Final copy (brevity law everywhere)

---

### Build order rationale
1. **Loop before looks** — M1→M2 give daily behavior change fast.
2. **Tracking makes it visible** — M3.
3. **Money + reflection deepen honesty** — M4.
4. **Dashboard + reports = the reward + intelligence** — M5/M6.
5. **MCP + PWA = convenience + reach** — M7/M8.
