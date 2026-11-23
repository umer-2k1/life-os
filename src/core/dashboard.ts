import type { Activity, Dream, Profile } from "@/db/entities";
import { addDaysISO, todayISO } from "@/lib/dates";
import { env } from "@/lib/env";
import { suggestPriorities, type SuggestedPriority } from "./activities";
import { ensureBootstrap } from "./bootstrap";
import { decayAlerts, type DecayAlert } from "./decay";
import { listDreams, pickResurfaceDream } from "./dreams";
import { getDay } from "./logs";
import { getProfile } from "./profile";
import { getStreak, getTotalPoints, scoreRange } from "./scores";
import { levelFor, type LevelInfo } from "./scoring";
import { savingsRollup, type NorthStarRollup } from "./savings";

export type HeatCell = { day: string; score: number };

export type Dashboard = {
  profile: Profile;
  rollup: NorthStarRollup;
  dreams: Dream[];
  today: { date: string; score: number | null; answered: boolean; bullets: string[]; next: string | null };
  streak: { current: number; best: number };
  points: number;
  level: LevelInfo;
  heatmap: HeatCell[];
  decay: DecayAlert[];
  why: Dream | null;
  priorities: Activity[];
  suggested: SuggestedPriority[];
  lastCheckinScore: number | null;
};

export async function getDashboard(): Promise<Dashboard> {
  await ensureBootstrap();
  const tz = env().TIMEZONE;
  const today = todayISO(tz);

  const [profile, dreams, day, streak, points, rollup] = await Promise.all([
    getProfile(),
    listDreams({}),
    getDay(today),
    getStreak(),
    getTotalPoints(),
    savingsRollup(),
  ]);

  const active = dreams.filter((d) => d.status === "active");
  const from = addDaysISO(today, -139);
  const scores = await scoreRange(from, today);
  const heatmap: HeatCell[] = scores.map((s) => ({ day: s.day, score: s.score }));

  const priorities = day.activities.filter((a) => a.column === "today");
  const suggested = priorities.length ? [] : await suggestPriorities(3);

  const lastAnswered = day.log.answered ? day.log : null;

  const dreamPriorityRank = { high: 0, medium: 1, low: 2 } as const;
  const topDreams = active
    .slice()
    .sort(
      (a, b) =>
        dreamPriorityRank[a.priority] - dreamPriorityRank[b.priority] ||
        (b.progress ?? 0) - (a.progress ?? 0),
    )
    .slice(0, 8);

  return {
    profile,
    rollup,
    dreams: topDreams,
    today: {
      date: today,
      score: lastAnswered ? day.log.score : null,
      answered: day.log.answered,
      bullets: day.log.summary_bullets ?? [],
      next: day.log.next_action ?? null,
    },
    streak,
    points,
    level: levelFor(points),
    heatmap,
    decay: decayAlerts(active),
    why: await pickResurfaceDream(active),
    priorities,
    suggested,
    lastCheckinScore: lastAnswered ? lastAnswered.score : null,
  };
}
