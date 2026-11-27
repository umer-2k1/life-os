import { Flame } from "lucide-react";
import Link from "next/link";
import type { LevelInfo } from "@/core/scoring";
import { Progress } from "@/components/ui/progress";
import { ScoreDial } from "./score-dial";

export function TodayCard({
  score,
  answered,
  streak,
  level,
}: {
  score: number | null;
  answered: boolean;
  streak: number;
  level: LevelInfo;
}) {
  return (
    <section className="card">
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow">Today</p>
        <span className="chip inline-flex items-center gap-1 rounded-full border border-[rgba(224,168,46,0.3)] bg-surface-2 px-2.5 py-1 text-[11.5px] font-semibold text-amber">
          <Flame size={12} aria-hidden /> {streak}-day
        </span>
      </div>

      <div className="mt-2 flex items-center gap-5">
        <ScoreDial score={score} size={122} />
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] leading-snug text-muted">
            {answered
              ? "Logged. The number is the truth."
              : "Today is still in progress."}
          </p>
          {!answered ? (
            <p className="mt-1 text-[11.5px] leading-snug text-faint">
              The daily ask reviews yesterday — or{" "}
              <Link href="/activity" className="text-gold-soft underline-offset-2 hover:underline">
                log today now
              </Link>
              .
            </p>
          ) : null}
          <div className="mt-3.5">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-faint">
              <span className="uppercase tracking-[0.12em]">
                Lv {level.level} · {level.title}
              </span>
              <span className="tnum">
                {level.current}/{level.nextAt}
              </span>
            </div>
            <Progress value={level.progress} label="Level progress" />
          </div>
        </div>
      </div>
    </section>
  );
}
