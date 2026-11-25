import type { Activity, Dream, Profile } from "@/db/entities";

export function dreamContext(dreams: Dream[]): string {
  return dreams
    .map((d) => `${d.title} · ${d.priority} · ${d.progress}%`)
    .join("; ");
}

export function systemPreamble(profile: Profile, dreams: Dream[]): string {
  return `You are the engine behind "Life OS", a private accountability system for one ambitious, self-admittedly procrastinating person. Their North Star: ${
    profile.north_star_label || profile.currency + " net worth"
  }. Identity: ${profile.identity_line || "someone who closes"}. Active dreams (title · priority · progress): ${dreamContext(
    dreams,
  )}.
Rules: be direct and honest, a little harsh when earned. Bullets/keywords only, never paragraphs, max 5 items. Judge everything by whether it moves money/goals. Output VALID JSON ONLY, no prose.`;
}

export function parsePrompt(raw: string, date: string): string {
  return `The person's update for ${date}:
"""${raw}"""
Split it into discrete activities. For each: classify relevance to their goals, estimate points, and for wasted time estimate days added to the most-relevant dream's timeline.
If anything is ambiguous (which dream? how long?), add a short follow-up question.
JSON shape: {"activities":[{"text":"short","dream_title":"string|null","relevance":"on_track|neutral|waste","score_delta":number,"time_cost_days":number,"suggestion":"short keywords"}],"followups":["string"],"needs_clarification":boolean}`;
}

export function scorePrompt(
  activities: Activity[],
  streak: number,
  recent: number[],
  dreams: Dream[],
): string {
  const compact = activities.map((a) => ({
    text: a.text,
    relevance: a.relevance,
    days: a.time_cost_days,
    dream: dreams.find((d) => d.id === a.dream_id)?.title ?? null,
  }));
  return `Today's activities: ${JSON.stringify(compact)}. Current streak: ${streak}. Recent scores (context only — do NOT copy them): ${JSON.stringify(
    recent,
  )}.
Rules:
- #1 priority right now: landing a remote job within 3 months. Work that advances Remote Job, freelancing or income must score higher than unrelated tasks.
- The score MUST be derived from TODAY's activities, never from the recent average.
- 0 on-track activities → score must be 0-30.
- Wrong: a greeting, "test", "hello", or "first message" is NOT an activity. If that is all there is, score 0-10 and say "No real update".
- On-track work raises the score; waste lowers it and must be priced in days added.
- Bullets must describe the actual activities, max 5, prefix 🟢 / 🟡 / 🔴; waste bullets include "≈ +N days to <Dream>".
- One single most important next action, short.
JSON shape: {"score":number,"summary_bullets":["..."],"trajectory_note":"short","next_action":"one concrete action"}`;
}

export function nextActionPrompt(dream: Dream): string {
  return `For the dream "${dream.title}" (why: ${dream.emotion?.emotional_reason ?? "not written"}; progress ${
    dream.progress
  }%; needs ${dream.money_needed ?? "nothing"}), give the single next action for THIS week. One sentence, concrete, no fluff.
JSON shape: {"action":"string"}`;
}

export function resurfacePrompt(dreams: Dream[]): string {
  return `Pick one active dream to resurface today from ${JSON.stringify(
    dreams.map((d) => ({ id: d.id, title: d.title, reason: d.emotion?.emotional_reason }))
  )} and return its emotional line verbatim-ish, trimmed to a single powerful sentence.
JSON shape: {"dream_id":"uuid","line":"string"}`;
}

export function reportPrompt(input: {
  kind: string;
  start: string;
  end: string;
  scores: unknown;
  activities: unknown;
  savings: unknown;
}): string {
  return `Build a ${input.kind} report for ${input.start}..${input.end} from: scores ${JSON.stringify(
    input.scores,
  )}, activities ${JSON.stringify(input.activities)}, savings movement ${JSON.stringify(input.savings)}.
Include: headline trend, trajectory per dream (projected time now vs last period), top wins, biggest waste (total days added), money vs North Star, and ONE highest-leverage fix. Keep every section to bullets/keywords.
JSON shape: {"headline":"string","trend":"up|flat|down","trajectory":[{"dream":"string","now":"~3.4 yrs","was":"~3.6 yrs","stalled":false}],"wins":[{"points":51,"text":"string"}],"waste":[{"text":"string","days_added":6}],"money":"string","fix_one_thing":"string","next_focus":["string"]}`;
}
