import { clamp } from "@/lib/utils";
import type { Activity, Relevance } from "@/db/entities";

export const POINTS = {
  on_track: 12,
  neutral: 3,
  waste: -8,
  checkin: 5,
  milestone: 20,
} as const;

export function activityPoints(relevance: Relevance): number {
  return POINTS[relevance];
}

export type ScorableActivity = Pick<
  Activity,
  "relevance" | "score_delta" | "time_cost_days"
>;

/**
 * Deterministic fallback score (0–100) used when the AI is unavailable.
 * On-track work and consistency raise it; waste lowers it and is priced.
 */
export function computeDailyScore(activities: ScorableActivity[], streak = 0): number {
  if (activities.length === 0) return 0;
  let raw = 42;
  for (const a of activities) {
    if (a.relevance === "on_track") raw += 16;
    else if (a.relevance === "neutral") raw += 5;
    else raw -= 18 + Math.min(12, Math.round(Number(a.time_cost_days ?? 0) * 3));
  }
  raw += Math.min(6, Math.max(0, streak)) * 2;
  // Diminishing returns for stacking many on-track items.
  if (activities.filter((a) => a.relevance === "on_track").length > 4) raw = 74 + (raw - 74) * 0.4;
  return clamp(Math.round(raw), 0, 100);
}

export function totalPoints(activities: ScorableActivity[], answeredCheckin = false): number {
  let pts = answeredCheckin ? POINTS.checkin : 0;
  for (const a of activities) {
    pts += a.score_delta || activityPoints(a.relevance);
  }
  return Math.max(0, Math.round(pts));
}

export type LevelInfo = {
  level: number;
  current: number;
  nextAt: number;
  progress: number;
  title: string;
};

const LEVEL_TITLES = [
  "Starting",
  "Showing up",
  "Building",
  "Consistent",
  "Relentless",
  "Obsessed",
  "Unstoppable",
  "Inevitable",
];

/** Levels get harder: 100, 250, 450, 700, 1000, 1350, 1750, ... */
export function levelFor(points: number): LevelInfo {
  let level = 1;
  let floor = 0;
  let span = 100;
  while (points >= floor + span && level < 50) {
    floor += span;
    level += 1;
    span += 50;
  }
  const current = points - floor;
  return {
    level,
    current,
    nextAt: span,
    progress: clamp(Math.round((current / span) * 100), 0, 100),
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
  };
}

export function grade(score: number): { label: string; tone: "green" | "amber" | "red" } {
  if (score >= 70) return { label: "On track", tone: "green" };
  if (score >= 40) return { label: "Neutral", tone: "amber" };
  return { label: "Wasted", tone: "red" };
}

/** Parse the "days added" cost out of a waste line, if present. */
export function parseCostDays(text: string): number {
  const m = text.match(/\+?\s*([0-9]+(?:\.[0-9]+)?)\s*day/i);
  return m ? Number(m[1]) : 0;
}
