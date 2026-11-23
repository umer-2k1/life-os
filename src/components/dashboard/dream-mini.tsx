import Link from "next/link";
import type { Dream } from "@/db/entities";
import { isStale } from "@/core/decay";
import { daysSinceTouched } from "@/core/decay";

const PRIORITY_TONE: Record<string, string> = {
  high: "text-red border-[rgba(228,86,74,0.3)] bg-[rgba(228,86,74,0.08)]",
  medium: "text-amber border-[rgba(224,168,46,0.3)] bg-[rgba(224,168,46,0.08)]",
  low: "text-muted border-border bg-surface-2",
};

export function DreamMini({ dream }: { dream: Dream }) {
  const days = daysSinceTouched(dream);
  const stale = isStale(dream);

  return (
    <Link
      href={`/dreams?open=${dream.id}`}
      className="card card-tight card-hover block min-w-[190px]"
    >
      <div
        className="relative grid h-[74px] place-items-center overflow-hidden rounded-lg border border-border"
        style={{ background: dream.accent ?? "linear-gradient(145deg,#242428,#111)" }}
      >
        {dream.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dream.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="text-[30px]" aria-hidden>
            {dream.glyph ?? "◆"}
          </span>
        )}
        <div aria-hidden className="scrim absolute inset-0" />
        <span
          className={`absolute left-2 top-2 rounded-full border px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${PRIORITY_TONE[dream.priority]}`}
        >
          {dream.priority}
        </span>
        <span className="tnum absolute bottom-2 right-2 rounded-full bg-[rgba(10,10,11,0.7)] px-1.5 py-0.5 text-[10px] font-semibold text-gold-soft">
          {dream.progress}%
        </span>
      </div>
      <p className="mt-2 truncate font-display text-[14.5px]">{dream.title}</p>
      <p className={`mt-0.5 text-[11px] ${stale ? "text-red" : "text-faint"}`}>
        {days === null ? "never touched" : `${days}d since touched`}
        {stale ? " ⚠" : ""}
      </p>
    </Link>
  );
}
