# 12 · AI Prompt Templates & Output Schemas

Concrete, implementation-ready prompts. All AI calls:
- Run through the provider router (OpenRouter → Groq → optional Grok/DeepSeek), free models first.
- Force **JSON output**, validated with zod. On invalid JSON, retry once with a "return valid JSON only" nudge, then fail soft.
- Receive **user context** (dreams, priorities, North Star) so judgments are personal.
- Obey the **brevity law**: bullets/keywords, ≤5 items, no paragraphs.

---

## Shared system preamble (prepend to every call)
```
You are the engine behind "Life OS", a private accountability system for one ambitious,
self-admittedly procrastinating person. Their North Star: {north_star}. Identity: {identity_line}.
Active dreams (title · priority · progress): {dreams_compact}.
Rules: be direct and honest, a little harsh when earned. Bullets/keywords only, never paragraphs,
max 5 items. Judge everything by whether it moves money/goals. Output VALID JSON ONLY, no prose.
```

---

## A. Parse daily update → activities
**Input**: `raw_input` (transcript/text), today's dreams.
**Prompt (user turn)**:
```
The person's update for {date}:
"""{raw_input}"""
Split it into discrete activities. For each: classify relevance to their goals, estimate points,
and for wasted time estimate days added to the most-relevant dream's timeline.
If anything is ambiguous (which dream? how long?), add a short follow-up question.
```
**Output schema**:
```json
{
  "activities": [
    { "text": "string (short)",
      "dream_title": "string|null",
      "relevance": "on_track|neutral|waste",
      "score_delta": -30,
      "time_cost_days": 0,
      "suggestion": "string (short, keywords)" }
  ],
  "followups": ["string"],
  "needs_clarification": false
}
```

## B. Score the day → 0–100
**Input**: parsed activities, streak, recent scores.
**Prompt**:
```
Given today's activities {activities_json}, current streak {streak}, and that on-track work and
consistency raise the score while waste lowers it, output today's score 0–100 and a ≤5-bullet recap
plus the single most important next action.
```
**Output schema**:
```json
{ "score": 72,
  "summary_bullets": ["🟢 ...","🟢 ...","🔴 3h YouTube → +2 days to Dream Car"],
  "trajectory_note": "string (short)",
  "next_action": "string (one concrete action)" }
```

## C. Follow-up question (when unclear)
```
From this update: "{raw_input}" and parsed {activities_json}, ask ONE short follow-up that would
most improve scoring accuracy. If nothing is unclear, return null.
```
Output: `{ "question": "string|null" }`

## D. Weekly / monthly report
**Input**: aggregated logs, activities, scores, savings over range.
**Prompt**:
```
Build a {kind} report for {range_start}..{range_end} from: scores {scores}, activities {activities},
savings movement {savings}. Include: headline trend, trajectory per dream (projected time now vs last
period), top wins, biggest waste (total days added), money vs North Star, and ONE highest-leverage fix.
Keep every section to bullets/keywords. Output JSON.
```
**Output schema**:
```json
{
  "headline": "string",
  "trend": "up|flat|down",
  "trajectory": [ { "dream": "Dream Car", "now": "~3.4 yrs", "was": "~3.6 yrs", "stalled": false } ],
  "wins": [ { "points": 51, "text": "string" } ],
  "waste": [ { "text": "string", "days_added": 6 } ],
  "money": "string",
  "fix_one_thing": "string",
  "next_focus": ["string"]
}
```
Report renderer turns this JSON into the markdown/HTML in `06-reports.md`, then PDF + email.

## E. Next action for a dream
```
For the dream "{title}" (why: {emotional_reason}; progress {progress}%; needs {money_needed}),
give the single next action for THIS week. One sentence, concrete, no fluff.
```
Output: `{ "action": "string" }`

## F. Resurface emotional anchor ("why you started")
```
Pick one active dream to resurface today and return its emotional line verbatim-ish, trimmed to a
single powerful sentence, plus the dream id.
```
Output: `{ "dream_id": "uuid", "line": "string" }`

---

## Voice pipeline
Telegram/MCP voice → download audio → **Groq Whisper** (`whisper-large-v3`) → transcript → feed as `raw_input` to prompt **A**.

## Model routing notes
- Default model = first working free model from OpenRouter (`:free` suffix), e.g. a free Llama/Qwen/DeepSeek chat model.
- On rate-limit/error → next provider/model in `ai_settings.provider_order`.
- Keep context small: send compact dream list, not full histories. Summarize past logs if needed.
- Temperature low (0.2–0.4) for parsing/scoring; a bit higher (0.6) for report prose and motivation lines.
