import { getDataSource } from "@/db/data-source";
import { DailyLog, ScoreDaily } from "@/db/entities";
import { env } from "@/lib/env";
import { addDaysISO, todayISO } from "@/lib/dates";

export type StreakInfo = { current: number; best: number };

export async function upsertScore(day: string, score: number, points: number): Promise<ScoreDaily> {
  const ds = await getDataSource();
  const repo = ds.getRepository(ScoreDaily);
  const userId = env().OWNER_USER_ID;
  let row = await repo.findOneBy({ user_id: userId, day });
  if (!row) row = repo.create({ user_id: userId, day, score, points });
  else {
    row.score = score;
    row.points = points;
  }
  return repo.save(row);
}

export async function scoreRange(from: string, to: string): Promise<ScoreDaily[]> {
  const ds = await getDataSource();
  return ds
    .getRepository(ScoreDaily)
    .createQueryBuilder("s")
    .where("s.user_id = :uid", { uid: env().OWNER_USER_ID })
    .andWhere("s.day >= :from AND s.day <= :to", { from, to })
    .orderBy("s.day", "ASC")
    .getMany();
}

export async function getStreak(): Promise<StreakInfo> {
  const ds = await getDataSource();
  const logs = await ds.getRepository(DailyLog).find({
    where: { user_id: env().OWNER_USER_ID, answered: true },
    order: { log_date: "DESC" },
    take: 400,
  });
  if (!logs.length) return { current: 0, best: 0 };

  const days = new Set(logs.map((l) => l.log_date));
  const today = todayISO(env().TIMEZONE);
  const yesterday = addDaysISO(today, -1);

  let cursor = days.has(today) ? today : days.has(yesterday) ? yesterday : null;
  let current = 0;
  while (cursor && days.has(cursor)) {
    current += 1;
    cursor = addDaysISO(cursor, -1);
  }

  // Best streak across all recorded days.
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    if (prev && addDaysISO(prev, 1) === day) run += 1;
    else run = 1;
    best = Math.max(best, run);
    prev = day;
  }

  return { current, best: Math.max(best, current) };
}

export async function getTotalPoints(): Promise<number> {
  const ds = await getDataSource();
  const row = await ds
    .getRepository(ScoreDaily)
    .createQueryBuilder("s")
    .select("COALESCE(SUM(s.points), 0)", "total")
    .where("s.user_id = :uid", { uid: env().OWNER_USER_ID })
    .getRawOne<{ total: string | number }>();
  return Number(row?.total ?? 0);
}
