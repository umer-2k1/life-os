# 05 · MCP Server

So I can drive the whole system from any MCP client (Claude, etc.) — **"add a dream", "log my day", "show this week"** — without touching a form or the UI.

## Design
- **Remote MCP server** (HTTP/SSE) in the **same TS codebase**, endpoint `/api/mcp`.
- Uses **@modelcontextprotocol/sdk**.
- Calls the **same `core/` service layer** as the website and bot → no duplicated logic.
- Auth: per-user token (header / bearer) so only I can use it.
- Can also run as a local **stdio** server for Claude Desktop if preferred.

## Tools (proposed)

### Dreams
- `list_dreams` — filter by status/priority. Returns short cards.
- `get_dream { dream_id }` — full detail incl. emotional anchor, milestones, savings.
- `create_dream { title, priority, target_date?, money_needed?, story?, emotional_reason? }`
- `update_dream { dream_id, ...fields }`
- `delete_dream { dream_id }`
- `add_dream_image { dream_id, url, caption? }`
- `add_milestone { dream_id, title, sort? }` · `complete_milestone { milestone_id }`
- `set_emotional_anchor { dream_id, story?, emotional_reason?, feeling? }`
- `next_action { dream_id }` — AI returns the single next action.

### Daily check-in (ask & answer from any MCP client / cloud agent)
- `get_pending_checkin` — is there an open check-in for today? Returns the question + status (so my connected agent knows to ask me). Empty if already answered on any channel.
- `answer_checkin { text, date? }` — submit my daily update here; closes the check-in everywhere, runs the full pipeline. Alias of `log_day`.
- `get_followups { date }` — any clarifying questions the AI still wants answered.
- `answer_followup { date, text }` — reply to a follow-up.
- Pattern: a cloud/desktop agent polls `get_pending_checkin` (or is nudged), asks me, then calls `answer_checkin`. No forms, no Telegram needed.

### Daily log / accountability
- `log_day { text, date? }` — same pipeline as the bot (parse → activities → score).
- `get_day { date }` — recap, score, activities.
- `add_activity { date, text, dream_id? }`
- `move_activity { activity_id, column }` — kanban.
- `today_priorities` / `set_priorities { items[] }`

### Scores & streaks
- `get_score { date }`
- `get_heatmap { range_start, range_end }`
- `get_streak`

### Savings
- `get_savings { dream_id }`
- `add_saving { dream_id, amount, note? }`
- `set_savings_target { dream_id, target_amount, currency }`

### Reports
- `generate_report { kind: weekly|monthly|custom, range_start?, range_end?, email? }`
- `get_report { report_id }`
- `list_reports`

### Reflection & profile
- `add_reflection { date, accomplished?, wasted?, improve? }`
- `get_profile` · `update_profile { north_star_amount?, identity_line?, motto? }`

## Resources (read-only, optional)
- `checkin://pending` — today's open check-in (question + status), so a client can surface it on connect.
- `dreams://all` — current dreams snapshot.
- `report://latest` — latest report markdown.
- `profile://me` — profile + North Star.

## Return format rule
- **Short, bullet/keyword output** (same brevity law as everywhere).
- Structured JSON for the client, plus a terse human summary.

## Why this matters
- Removes the last excuse: I can log and review by *talking to an agent*, not filling forms.
- The bot, the site, and MCP are three doors into **one system**.
