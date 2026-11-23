import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { activitiesForDay } from "@/core/activities";
import { getDay } from "@/core/logs";
import { env } from "@/lib/env";
import { addDaysISO, formatRange, todayISO } from "@/lib/dates";
import { KanbanBoard, type BoardActivity } from "./kanban-board";
import { logForDateAction } from "./actions";

export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const today = todayISO(env().TIMEZONE);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? "") ? params.date! : today;

  const [day, rows] = await Promise.all([getDay(date), activitiesForDay(date)]);
  const activities: BoardActivity[] = rows.map((a) => ({
    id: a.id,
    text: a.text,
    relevance: a.relevance,
    score_delta: a.score_delta,
    time_cost_days: Number(a.time_cost_days ?? 0),
    suggestion: a.suggestion ?? null,
    column: a.column,
    dream_title: a.dream_title,
    dream_glyph: a.dream_glyph,
  }));

  const waste = activities
    .filter((a) => a.relevance === "waste")
    .reduce((sum, a) => sum + a.time_cost_days, 0);

  return (
    <div className="space-y-4 motion-safe:animate-[rise_0.3s_ease_both]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Activity</p>
          <h1 className="mt-1 font-display text-2xl">{formatRange(date, date)}</h1>
          <p className="mt-1 flex items-center gap-2 text-[12.5px] text-muted">
            <Flame size={13} className="text-amber" aria-hidden />
            {day.log.answered ? `Score ${day.log.score} · logged` : "Not logged yet"}
            {waste > 0 ? <span className="text-red">· +{waste.toFixed(1)} days wasted</span> : null}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button asChild variant="outline" size="icon" aria-label="Previous day">
            <Link href={`/activity?date=${addDaysISO(date, -1)}`}>
              <ChevronLeft size={15} aria-hidden />
            </Link>
          </Button>
          <form action="/activity" method="get">
            <input
              type="date"
              name="date"
              defaultValue={date}
              aria-label="Pick a date"
              className="h-9 rounded-[10px] border border-border bg-surface-2 px-2.5 text-[12.5px] text-fg"
            />
          </form>
          <Button asChild variant="outline" size="icon" aria-label="Next day">
            <Link href={`/activity?date=${addDaysISO(date, 1)}`}>
              <ChevronRight size={15} aria-hidden />
            </Link>
          </Button>
          {date !== today ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/activity">Today</Link>
            </Button>
          ) : null}
        </div>
      </header>

      {day.log.summary_bullets.length ? (
        <div className="card-tight card">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">Recap</Badge>
            <span className="text-[11.5px] text-faint">{day.log.trajectory_note}</span>
          </div>
          <ul className="mt-2 space-y-1">
            {day.log.summary_bullets.map((b, i) => (
              <li key={i} className="text-[12.5px] leading-snug text-muted">
                {b}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <KanbanBoard initial={activities} />

      <section className="card">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Log this day</p>
          <span className="text-[11px] text-faint">
            The bot asks you — text or voice. This box is the fallback.
          </span>
        </div>
        <form action={logForDateAction} className="mt-2.5 space-y-2.5">
          <input type="hidden" name="date" value={date} />
          <Textarea
            name="text"
            required
            placeholder="Built… Emailed… Wasted 2h on…"
            className="min-h-20"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-faint">
              One update per day. Re-logging replaces today&apos;s board.
            </p>
            <Button type="submit" variant="gold" size="sm">
              {day.log.answered ? "Re-log day" : "Log day"}
            </Button>
          </div>
        </form>
      </section>

      <p className="pb-2 text-center text-[11px] text-faint">
        Drag cards between columns · arrows work on phone.
      </p>
    </div>
  );
}
