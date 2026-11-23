import { getDataSource } from "@/db/data-source";
import {
  Activity,
  DailyLog,
  Dream,
  Reflection,
  ScoreDaily,
  type InputKind,
} from "@/db/entities";
import { env } from "@/lib/env";
import { todayISO } from "@/lib/dates";
import { clamp } from "@/lib/utils";
import { heuristicParse, type ParsedActivity } from "./ai/heuristic";
import { aiParseUpdate, aiScoreDay } from "./ai";
import { heuristicNextAction, listDreams, touchDream } from "./dreams";
import { AppError } from "./errors";
import { computeDailyScore, totalPoints } from "./scoring";
import { getStreak, upsertScore } from "./scores";

export type DayView = {
  log: DailyLog;
  activities: Activity[];
  reflection: Reflection | null;
};

export async function ensureDailyLog(date?: string): Promise<DailyLog> {
  const ds = await getDataSource();
  const userId = env().OWNER_USER_ID;
  const day = date ?? todayISO(env().TIMEZONE);
  const repo = ds.getRepository(DailyLog);
  let log = await repo.findOneBy({ user_id: userId, log_date: day });
  if (!log) {
    log = await repo.save(
      repo.create({
        user_id: userId,
        log_date: day,
        answered: false,
        score: 0,
        summary_bullets: [],
        input_kind: null,
      }),
    );
  }
  return log;
}

export async function getDay(date?: string): Promise<DayView> {
  const ds = await getDataSource();
  const log = await ensureDailyLog(date);
  const activities = await ds.getRepository(Activity).find({
    where: { daily_log_id: log.id },
    order: { created_at: "ASC" },
  });
  const reflection = await ds.getRepository(Reflection).findOneBy({ daily_log_id: log.id });
  return { log, activities, reflection };
}

function emoji(relevance: string) {
  return relevance === "on_track" ? "🟢" : relevance === "waste" ? "🔴" : "🟡";
}

function buildBullets(activities: Activity[], dreams: Dream[]): string[] {
  const byId = new Map(dreams.map((d) => [d.id, d.title]));
  return activities
    .slice(0, 5)
    .map((a) => {
      const dream = a.dream_id ? byId.get(a.dream_id) : null;
      const tail = dream ? ` → ${dream}` : "";
      if (a.relevance === "waste" && a.time_cost_days > 0) {
        return `${emoji(a.relevance)} ${a.text} → ≈ +${a.time_cost_days} days${dream ? ` to ${dream}` : ""}`;
      }
      return `${emoji(a.relevance)} ${a.text}${tail}`;
    });
}

function trajectoryNote(
  score: number,
  streak: number,
  previousScores: number[],
): string {
  if (!previousScores.length) {
    return `Day one. ${streak > 0 ? `${streak}-day streak.` : "Start the streak."}`;
  }
  const avg = Math.round(
    previousScores.reduce((a, b) => a + b, 0) / previousScores.length,
  );
  const diff = score - avg;
  if (diff >= 8) return `Up ${diff} vs your last 7-day average. Keep it.`;
  if (diff <= -8) return `Down ${Math.abs(diff)} vs your last 7-day average. Fix one thing tomorrow.`;
  return `Holding near your average of ${avg}. Push one real action.`;
}

async function resolveDreamId(
  activity: ParsedActivity,
  dreams: Dream[],
): Promise<string | null> {
  if (!activity.dream_title) return null;
  return dreams.find((d) => d.title === activity.dream_title)?.id ?? null;
}

async function previousScores(ds: Awaited<ReturnType<typeof getDataSource>>, before: string) {
  const rows = await ds
    .getRepository(ScoreDaily)
    .createQueryBuilder("s")
    .where("s.user_id = :uid", { uid: env().OWNER_USER_ID })
    .andWhere("s.day < :day", { day: before })
    .orderBy("s.day", "DESC")
    .take(7)
    .getMany();
  return rows.map((r) => r.score).reverse();
}

export type LogDayResult = DayView & { engine: "ai" | "heuristic" };

/**
 * The single entry point every channel calls: web, Telegram, MCP, cron follow-ups.
 * Parse → activities → score → recap. Idempotent per day (re-logging replaces activities).
 */
export async function logDay(input: {
  text: string;
  date?: string;
  input_kind?: InputKind;
}): Promise<LogDayResult> {
  const ds = await getDataSource();
  const text = input.text.trim();
  if (!text) throw new AppError("BAD_REQUEST", "Nothing to log.");

  const log = await ensureDailyLog(input.date);
  const dreams = await listDreams({ status: "active" });

  // AI when a key is configured; heuristic keeps the loop alive offline.
  let parsed = heuristicParse(text, dreams);
  try {
    const ai = await aiParseUpdate(text, dreams, log.log_date);
    if (ai) parsed = ai;
  } catch (err) {
    console.warn("[ai:parse] fallback to heuristic:", err instanceof Error ? err.message : err);
  }

  const activityRepo = ds.getRepository(Activity);
  await activityRepo.delete({ daily_log_id: log.id });
  await ds.getRepository(Reflection).delete({ daily_log_id: log.id });

  const rows: Activity[] = [];
  for (const item of parsed.activities) {
    const dreamId = await resolveDreamId(item, dreams);
    const row = activityRepo.create({
      daily_log_id: log.id,
      dream_id: dreamId,
      text: item.text,
      relevance: item.relevance,
      score_delta: item.score_delta,
      time_cost_days: item.time_cost_days,
      suggestion: item.suggestion,
      column: item.relevance === "waste" ? "wasted" : "done",
      priority: false,
      activity_date: log.log_date,
    });
    rows.push(await activityRepo.save(row));
    if (dreamId) await touchDream(dreamId);
  }

  const streak = await getStreak();
  let score = computeDailyScore(rows, streak.current);
  let bullets = buildBullets(rows, dreams);
  let trajectory = trajectoryNote(score, streak.current, []);
  let nextAction: string | null = null;
  let engine = parsed.engine;
  const points = totalPoints(rows, true);
  const prev = await previousScores(ds, log.log_date);
  trajectory = trajectoryNote(score, streak.current, prev);

  try {
    const aiScore = await aiScoreDay(rows, dreams, streak.current, prev);
    if (aiScore) {
      score = aiScore.score;
      bullets = aiScore.bullets;
      trajectory = aiScore.trajectory;
      nextAction = aiScore.next;
      engine = "ai";
    }
  } catch (err) {
    console.warn("[ai:score] fallback:", err instanceof Error ? err.message : err);
  }

  const openDream = dreams
    .slice()
    .sort((a, b) => {
      const at = a.last_touched_at ? new Date(a.last_touched_at).getTime() : 0;
      const bt = b.last_touched_at ? new Date(b.last_touched_at).getTime() : 0;
      return at - bt;
    })[0];

  log.raw_input = log.raw_input ? `${log.raw_input}\n${text}` : text;
  log.input_kind = input.input_kind ?? "web";
  log.score = score;
  log.summary_bullets = bullets;
  log.trajectory_note = trajectory;
  log.next_action =
    nextAction ||
    (openDream ? heuristicNextAction(openDream) : "Add a dream — pick the one that scares you.");
  log.answered = true;
  log.last_ping_at = new Date();
  if (!log.asked_at) log.asked_at = new Date();
  await ds.getRepository(DailyLog).save(log);

  await upsertScore(log.log_date, score, points);

  return { ...(await getDay(log.log_date)), engine };
}

export async function saveReflection(input: {
  date?: string;
  accomplished?: string | null;
  wasted?: string | null;
  improve?: string | null;
}): Promise<Reflection> {
  const ds = await getDataSource();
  const log = await ensureDailyLog(input.date);
  const repo = ds.getRepository(Reflection);
  let reflection = await repo.findOneBy({ daily_log_id: log.id });
  if (!reflection) reflection = repo.create({ daily_log_id: log.id });
  if (input.accomplished !== undefined) reflection.accomplished = input.accomplished;
  if (input.wasted !== undefined) reflection.wasted = input.wasted;
  if (input.improve !== undefined) reflection.improve = input.improve;
  return repo.save(reflection);
}

export async function markAsked(date?: string): Promise<DailyLog> {
  const ds = await getDataSource();
  const log = await ensureDailyLog(date);
  const now = new Date();
  log.asked_at = log.asked_at ?? now;
  log.last_ping_at = now;
  return ds.getRepository(DailyLog).save(log);
}

export type PendingCheckin = {
  open: boolean;
  date: string;
  question: string;
  day: number;
  streak: number;
  asked_at: string | null;
  last_ping_at: string | null;
};

export async function pendingCheckin(date?: string): Promise<PendingCheckin> {
  const log = await ensureDailyLog(date);
  const streak = await getStreak();
  const start = new Date("2026-01-01T00:00:00Z").getTime();
  const day = clamp(
    Math.floor((Date.now() - start) / 86_400_000) + 1,
    1,
    9999,
  );
  return {
    open: !log.answered,
    date: log.log_date,
    question: log.answered
      ? "Already logged today. Come back tomorrow."
      : `Day ${day}. What did you do today toward the money / the dreams? Voice or text.`,
    day,
    streak: streak.current,
    asked_at: log.asked_at ? new Date(log.asked_at).toISOString() : null,
    last_ping_at: log.last_ping_at ? new Date(log.last_ping_at).toISOString() : null,
  };
}
