import type { Dream } from "@/db/entities";
import type { Relevance } from "@/db/entities";

export type ParsedActivity = {
  text: string;
  dream_title: string | null;
  relevance: Relevance;
  score_delta: number;
  time_cost_days: number;
  suggestion: string;
};

export type ParsedUpdate = {
  activities: ParsedActivity[];
  followups: string[];
  needs_clarification: boolean;
  engine: "ai" | "heuristic";
};

const WASTE = [
  "youtube",
  "netflix",
  "tiktok",
  "instagram",
  "reels",
  "shorts",
  "scrolled",
  "scrolling",
  "doomscroll",
  "binged",
  "binge",
  "series",
  "wasted",
  "procrastinat",
  "idle",
  "nothing",
  "gta",
  "valorant",
  "fortnite",
  "gaming",
  "played games",
  "twitter",
  "facebook",
  "reddit",
];

const ON_TRACK = [
  "built",
  "shipped",
  "coded",
  "deployed",
  "fixed",
  "applied",
  "sent",
  "client",
  "closed",
  "saved",
  "invested",
  "studied",
  "practiced",
  "read",
  "learned",
  "learnt",
  "wrote",
  "recorded",
  "outreach",
  "reached out",
  "recruiter",
  "networking",
  "pitch",
  "interview",
  "launched",
  "gym",
  "trained",
  "workout",
  "walked",
  "meditated",
  "planned",
  "reviewed",
  "studied",
  "course",
  "lesson",
  "client",
  "sales",
  "revenue",
  "invoice",
];

const DREAM_HINTS: Array<{ words: string[]; title: string }> = [
  { words: ["car", "drive", "vehicle"], title: "Dream Car" },
  { words: ["umrah", "kaaba", "mecca", "makkah"], title: "Umrah" },
  { words: ["playstation", "ps5", "console"], title: "PlayStation 5" },
  { words: ["gaming pc", " pc ", "pc build", "gpu"], title: "Gaming PC" },
  { words: ["laptop", "macbook"], title: "Laptop Upgrade" },
  { words: ["save", "saved", "saving", "money", "income", "invest", "revenue"], title: "Financial Growth" },
  { words: ["read", "book", "habit", "mindset", "discipline", "pray", "sleep"], title: "Personal Development" },
  { words: ["client", "job", "career", "skill", "pitch", "interview", "work", "project"], title: "Career & Skills" },
];

function splitActivities(raw: string): string[] {
  const lines = raw
    .split(/\n|(?<=[.!?])\s+|;\s*/g)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length === 1) {
    return raw
      .split(/,\s*(?=(?:i|then|and|also)\s)/gi)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return lines;
}

function hoursFrom(text: string): number {
  const h = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i);
  const m = text.match(/(\d+)\s*(?:m|min|mins|minute|minutes)\b/i);
  let hours = 0;
  if (h) hours += Number(h[1]);
  if (m) hours += Number(m[1]) / 60;
  return hours;
}

function matchDream(text: string, dreams: Dream[]): Dream | null {
  const lower = ` ${text.toLowerCase()} `;
  const byHint = DREAM_HINTS.find((h) => h.words.some((w) => lower.includes(w)));
  if (byHint) {
    const hit = dreams.find((d) => d.title.toLowerCase() === byHint.title.toLowerCase());
    if (hit) return hit;
  }
  return (
    dreams.find((d) => {
      const words = d.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      return words.some((w) => lower.includes(w));
    }) ?? null
  );
}

export function classifyRelevance(text: string): Relevance {
  const lower = text.toLowerCase();
  if (WASTE.some((w) => lower.includes(w))) return "waste";
  if (ON_TRACK.some((w) => lower.includes(w))) return "on_track";
  return "neutral";
}

export function estimateWasteDays(text: string): number {
  const hours = hoursFrom(text);
  return hours > 0 ? Math.round(hours * 0.7 * 10) / 10 : 0;
}

/**
 * Deterministic fallback used when no AI key is configured (or the AI fails).
 * Keeps the whole loop functional offline — never blocks logging.
 */
export function heuristicParse(raw: string, dreams: Dream[]): ParsedUpdate {
  const chunks = splitActivities(raw).slice(0, 8);
  const activities: ParsedActivity[] = chunks.map((chunk) => {
    const relevance = classifyRelevance(chunk);
    const dream = matchDream(chunk, dreams);
    const hours = hoursFrom(chunk);
    const words = chunk.split(/\s+/);
    const text = words.slice(0, 14).join(" ").replace(/[.,;]$/, "");

    let score_delta = 0;
    let time_cost_days = 0;
    let suggestion = "Keep it short. Do the next physical step.";

    if (relevance === "on_track") {
      score_delta = 12;
      suggestion = `Double this tomorrow. ${dream ? `Tie it to ${dream.title}.` : "Name the dream it serves."}`;
    } else if (relevance === "waste") {
      const hrs = hours > 0 ? hours : 1;
      time_cost_days = Math.round(hrs * 0.7 * 10) / 10;
      score_delta = -18;
      suggestion = `Cut it to 20 min. ${dream ? `Put the hour into ${dream.title}.` : "No dream = no excuse."}`;
    } else {
      score_delta = 3;
    }

    return {
      text,
      dream_title: dream?.title ?? null,
      relevance,
      score_delta,
      time_cost_days,
      suggestion: suggestion.slice(0, 180),
    };
  });

  const followups: string[] = [];
  const onTrackNoDream = activities.find((a) => a.relevance === "on_track" && !a.dream_title);
  if (onTrackNoDream) followups.push(`"${onTrackNoDream.text}" — which dream does this move?`);
  if (activities.some((a) => a.relevance === "waste" && a.time_cost_days === 0)) {
    followups.push("How many hours did the wasted time take?");
  }

  return {
    activities,
    followups: followups.slice(0, 2),
    needs_clarification: followups.length > 0,
    engine: "heuristic",
  };
}
