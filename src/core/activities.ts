import { getDataSource } from "@/db/data-source";
import { Activity, DailyLog, Dream, type KanbanColumn } from "@/db/entities";
import { env } from "@/lib/env";
import { todayISO } from "@/lib/dates";
import { AppError } from "./errors";
import { ensureDailyLog } from "./logs";
import type { z } from "zod";
import type { activityCreateSchema, activityUpdateSchema } from "./schemas";

export type ActivityWithDream = Activity & { dream_title: string | null; dream_glyph: string | null };

export async function activitiesBetween(from: string, to: string): Promise<ActivityWithDream[]> {
  const ds = await getDataSource();
  const rows = await ds
    .getRepository(Activity)
    .createQueryBuilder("a")
    .innerJoin(DailyLog, "l", "l.id = a.daily_log_id")
    .where("l.user_id = :uid", { uid: env().OWNER_USER_ID })
    .andWhere("l.log_date >= :from AND l.log_date <= :to", { from, to })
    .orderBy("l.log_date", "DESC")
    .addOrderBy("a.created_at", "ASC")
    .getMany();

  const dreams = await ds.getRepository(Dream).find({
    where: { user_id: env().OWNER_USER_ID },
  });
  const byId = new Map(dreams.map((d) => [d.id, d]));
  return rows.map((a) => ({
    ...a,
    dream_title: a.dream_id ? (byId.get(a.dream_id)?.title ?? null) : null,
    dream_glyph: a.dream_id ? (byId.get(a.dream_id)?.glyph ?? null) : null,
  }));
}

export async function activitiesForDay(date?: string): Promise<ActivityWithDream[]> {
  const day = date ?? todayISO(env().TIMEZONE);
  return activitiesBetween(day, day);
}

export async function createActivity(input: z.infer<typeof activityCreateSchema>) {
  const ds = await getDataSource();
  const log = await ensureDailyLog(input.date);
  const repo = ds.getRepository(Activity);
  const relevance = input.relevance ?? "neutral";
  const row = await repo.save(
    repo.create({
      daily_log_id: log.id,
      activity_date: log.log_date,
      text: input.text,
      dream_id: input.dream_id ?? null,
      relevance,
      score_delta: relevance === "on_track" ? 12 : relevance === "waste" ? -18 : 3,
      time_cost_days: 0,
      column: input.column ?? "today",
      priority: false,
    }),
  );
  return row;
}

export async function updateActivity(
  id: string,
  input: z.infer<typeof activityUpdateSchema>,
): Promise<Activity> {
  const ds = await getDataSource();
  const repo = ds.getRepository(Activity);
  const activity = await repo.findOneBy({ id });
  if (!activity) throw new AppError("NOT_FOUND", "Activity not found.");
  if (input.column !== undefined) activity.column = input.column as KanbanColumn;
  if (input.dream_id !== undefined) activity.dream_id = input.dream_id;
  if (input.text !== undefined) activity.text = input.text;
  if (input.priority !== undefined) activity.priority = input.priority;
  return repo.save(activity);
}

export async function deleteActivity(id: string): Promise<{ ok: true }> {
  const ds = await getDataSource();
  const repo = ds.getRepository(Activity);
  const activity = await repo.findOneBy({ id });
  if (!activity) throw new AppError("NOT_FOUND", "Activity not found.");
  await repo.remove(activity);
  return { ok: true };
}

export type SuggestedPriority = { text: string; dream_id: string | null; dream_title: string | null };

export async function suggestPriorities(limit = 3): Promise<SuggestedPriority[]> {
  const ds = await getDataSource();
  const dreams = await ds.getRepository(Dream).find({
    where: { user_id: env().OWNER_USER_ID, status: "active" },
    relations: { milestones: true },
    order: { priority: "ASC" },
  });
  const rank = { high: 0, medium: 1, low: 2 };
  const sorted = dreams.sort((a, b) => rank[a.priority] - rank[b.priority]);
  return sorted.slice(0, limit).map((d) => {
    const open = (d.milestones ?? []).filter((m) => !m.done).sort((a, b) => a.sort - b.sort);
    return {
      text: open[0]?.title ?? `Move ${d.title} forward for 30 minutes`,
      dream_id: d.id,
      dream_title: d.title,
    };
  });
}

export async function completePriority(id: string): Promise<{ ok: true }> {
  const ds = await getDataSource();
  const repo = ds.getRepository(Activity);
  const activity = await repo.findOneBy({ id });
  if (!activity) throw new AppError("NOT_FOUND", "Activity not found.");
  activity.column = "done";
  activity.relevance = "on_track";
  activity.score_delta = Math.max(activity.score_delta, 12);
  await repo.save(activity);
  return { ok: true };
}
