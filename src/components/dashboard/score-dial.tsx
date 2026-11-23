import { cn } from "@/lib/utils";

export function ScoreDial({
  score,
  size = 128,
  className,
}: {
  score: number | null;
  size?: number;
  className?: string;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const value = score === null ? 0 : Math.max(0, Math.min(100, score));
  const offset = c - (value / 100) * c;

  return (
    <div className={cn("relative flex-none", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id="score-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8a6d28" />
            <stop offset="55%" stopColor="#c8a24b" />
            <stop offset="100%" stopColor="#e7d4a2" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth="7"
        />
        {score !== null ? (
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="url(#score-gold)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            className="transition-[stroke-dashoffset] duration-700"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="tnum font-display text-[34px] leading-none text-fg">
          {score === null ? "—" : score}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.14em] text-faint">
          {score === null ? "no log" : "/ 100"}
        </span>
      </div>
    </div>
  );
}
