import type { Activity, Dream } from "@/db/entities";

export type DecayAlert = {
  dream: Dream;
  days: number;
  severity: "amber" | "red";
};

/**
 * A dream decays when untouched. High-priority dreams go red sooner.
 */
export function decayAlerts(dreams: Dream[], now = new Date()): DecayAlert[] {
  const alerts: DecayAlert[] = [];
  for (const dream of dreams) {
    if (dream.status !== "active") continue;
    const last = dream.last_touched_at
      ? new Date(dream.last_touched_at)
      : dream.created_at
        ? new Date(dream.created_at)
        : null;
    if (!last) continue;
    const days = Math.floor((now.getTime() - last.getTime()) / 86_400_000);
    const threshold = dream.priority === "high" ? 3 : dream.priority === "medium" ? 7 : 14;
    if (days >= threshold) {
      alerts.push({
        dream,
        days,
        severity: days >= threshold * 2 ? "red" : "amber",
      });
    }
  }
  return alerts.sort((a, b) => b.days - a.days);
}

/** Days since the dream was last touched (null when never). */
export function daysSinceTouched(dream: Dream): number | null {
  if (!dream.last_touched_at) return null;
  return Math.floor((Date.now() - new Date(dream.last_touched_at).getTime()) / 86_400_000);
}

export function isStale(dream: Dream): boolean {
  const days = daysSinceTouched(dream);
  const threshold = dream.priority === "high" ? 5 : dream.priority === "medium" ? 10 : 21;
  return days === null ? false : days >= threshold;
}

export function wasteDays(activities: Activity[]): number {
  return Math.round(
    activities
      .filter((a) => a.relevance === "waste")
      .reduce((sum, a) => sum + Number(a.time_cost_days ?? 0), 0) * 10,
  ) / 10;
}
