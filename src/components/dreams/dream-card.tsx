import type { Dream } from "@/db/entities";
import { daysSinceTouched, isStale } from "@/core/decay";

const PRIORITY_TONE: Record<string, string> = {
  high: "text-red border-[rgba(228,86,74,0.35)] bg-[rgba(10,10,11,0.55)]",
  medium: "text-amber border-[rgba(224,168,46,0.35)] bg-[rgba(10,10,11,0.55)]",
  low: "text-muted border-[rgba(245,245,244,0.2)] bg-[rgba(10,10,11,0.55)]",
};

function Ring({ value }: { value: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[rgba(10,10,11,0.72)]">
      <svg viewBox="0 0 36 36" className="absolute inset-0 h-9 w-9 -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(245,245,244,0.18)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
        />
      </svg>
      <span className="tnum relative text-[9.5px] font-semibold text-gold-soft">{v}</span>
    </span>
  );
}

export function DreamCard({ dream, href }: { dream: Dream; href: string }) {
  const days = daysSinceTouched(dream);
  const stale = isStale(dream);

  return (
    <a
      href={href}
      className="card card-hover block overflow-hidden p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ background: dream.accent ?? "linear-gradient(145deg,#242428,#111114)" }}
      >
        {dream.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dream.cover_image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center text-[52px]">
            {dream.glyph ?? "◆"}
          </span>
        )}
        <div aria-hidden className="scrim absolute inset-0" />
        <span
          className={`absolute left-2.5 top-2.5 rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.09em] ${PRIORITY_TONE[dream.priority]}`}
        >
          {dream.priority}
        </span>
        <span className="absolute bottom-2.5 right-2.5">
          <Ring value={dream.progress} />
        </span>
      </div>

      <div className="px-3.5 py-3">
        <h3 className="truncate font-display text-[16px]">{dream.title}</h3>
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
          <span className="truncate text-faint">
            {dream.target_date
              ? new Date(`${dream.target_date}T12:00:00Z`).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "Ongoing"}
          </span>
          <span className={`flex-none ${stale ? "text-red" : "text-faint"}`}>
            {days === null ? "never touched" : `${days}d ago`}
            {stale ? " ⚠" : ""}
          </span>
        </div>
      </div>
    </a>
  );
}
