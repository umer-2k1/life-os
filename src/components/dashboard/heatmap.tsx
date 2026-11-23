import { addDaysISO } from "@/lib/dates";
import { isWeekend } from "@/lib/dates";
import { cn } from "@/lib/utils";

export type HeatCell = { day: string; score: number };

function level(score: number): number {
  if (score <= 0) return 0;
  if (score < 30) return 1;
  if (score < 55) return 2;
  if (score < 75) return 3;
  return 4;
}

const COLORS = [
  "bg-surface-3",
  "bg-[rgba(200,162,75,0.18)]",
  "bg-[rgba(200,162,75,0.38)]",
  "bg-[rgba(200,162,75,0.62)]",
  "bg-[var(--gold)]",
];

export function Heatmap({ cells, weeks = 20 }: { cells: HeatCell[]; weeks?: number }) {
  const byDay = new Map(cells.map((c) => [c.day, c.score]));
  const end = new Date();
  const endISO = end.toISOString().slice(0, 10);
  const total = weeks * 7;
  const startISO = addDaysISO(endISO, -(total - 1));

  const days: string[] = [];
  for (let i = 0; i < total; i++) days.push(addDaysISO(startISO, i));

  // Pad so columns are full weeks (Mon-first).
  const firstDay = new Date(`${days[0]}T12:00:00Z`).getUTCDay();
  const padStart = (firstDay + 6) % 7;
  const padded = [...Array<string>(padStart).fill(""), ...days];

  const columns: string[][] = [];
  for (let i = 0; i < padded.length; i += 7) columns.push(padded.slice(i, i + 7));

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1" role="img" aria-label="Consistency heatmap">
        {columns.map((col, ci) => (
          <div key={ci} className="grid grid-rows-7 gap-[3px]">
            {col.map((day, di) => {
              if (!day) return <span key={di} className="h-3 w-3" />;
              const score = byDay.get(day) ?? 0;
              return (
                <span
                  key={day}
                  title={`${day} · score ${score}`}
                  className={cn(
                    "h-3 w-3 rounded-[3px]",
                    COLORS[level(score)],
                    isWeekend(day) && score === 0 ? "opacity-70" : "",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-faint">
        <span>Less</span>
        {COLORS.map((c, i) => (
          <span key={i} className={cn("h-2.5 w-2.5 rounded-[3px]", c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
