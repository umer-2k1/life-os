import Link from "next/link";
import type { Dream } from "@/db/entities";
import { daysSinceTouched } from "@/core/decay";

export function WhyStarted({ dream }: { dream: Dream | null }) {
  if (!dream) return null;
  const reason = dream.emotion?.emotional_reason || dream.emotion?.story;
  if (!reason) return null;
  const days = daysSinceTouched(dream);

  return (
    <section className="card relative overflow-hidden">
      <div className="grid gap-4 sm:grid-cols-[132px_1fr] sm:items-center">
        <div
          className="relative grid h-[132px] w-full place-items-center overflow-hidden rounded-xl border border-border sm:h-[118px] sm:w-[118px]"
          style={{ background: dream.accent ?? "linear-gradient(145deg,#222,#111)" }}
        >
          {dream.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dream.cover_image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden className="text-[46px]">
              {dream.glyph ?? "◆"}
            </span>
          )}
          <div aria-hidden className="scrim absolute inset-0" />
        </div>

        <div className="min-w-0">
          <p className="eyebrow">Why you started</p>
          <blockquote className="mt-2 border-l-2 border-[rgba(200,162,75,0.5)] pl-3 font-display text-[15.5px] italic leading-relaxed text-gold-soft">
            &ldquo;{reason}&rdquo;
          </blockquote>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-faint">
            <Link
              href={`/dreams?open=${dream.id}`}
              className="font-medium text-muted underline-offset-2 hover:text-gold-soft hover:underline"
            >
              {dream.title}
            </Link>
            <span aria-hidden>·</span>
            <span>{dream.emotion?.feeling || "The reason it matters"}</span>
            {days !== null ? (
              <>
                <span aria-hidden>·</span>
                <span>{days}d since touched</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
