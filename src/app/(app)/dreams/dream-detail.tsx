import Link from "next/link";
import { Check, Plus, X } from "lucide-react";
import type { Dream } from "@/db/entities";
import { heuristicNextAction } from "@/core/dreams";
import { daysSinceTouched, isStale } from "@/core/decay";
import { formatMoney, pct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ImageUploader } from "./image-uploader";
import { DeleteDreamButton } from "./delete-dream-button";
import {
  addMilestoneAction,
  addSavingAction,
  addImageAction,
  removeImageAction,
  removeMilestoneAction,
  setEmotionAction,
  toggleMilestoneAction,
} from "./actions";

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.12em] text-faint">{label}</p>
      <p className="tnum mt-0.5 font-display text-[16px]">{value}</p>
    </div>
  );
}

export function DreamDetail({ dream }: { dream: Dream }) {
  const emotion = dream.emotion;
  const savings = dream.savings;
  const saved = Number(savings?.saved_amount ?? 0);
  const target = Number(savings?.target_amount ?? dream.money_needed ?? 0);
  const currency = savings?.currency ?? "PKR";
  const days = daysSinceTouched(dream);
  const next = heuristicNextAction(dream);
  const doneMilestones = (dream.milestones ?? []).filter((m) => m.done);

  return (
    <div className="space-y-5">
      <div
        className="relative -mx-5 -mt-4 grid h-[170px] place-items-center overflow-hidden"
        style={{ background: dream.accent ?? "linear-gradient(145deg,#242428,#111114)" }}
      >
        {dream.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dream.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span aria-hidden className="text-[64px]">{dream.glyph ?? "◆"}</span>
        )}
        <div aria-hidden className="scrim absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-gold-soft">{dream.priority} priority</p>
            <h2 className="mt-1 font-display text-[26px] leading-tight">{dream.title}</h2>
          </div>
          <span className="tnum rounded-full border border-border bg-[rgba(10,10,11,0.6)] px-2.5 py-1 text-[11px] text-muted">
            {days === null ? "never touched" : `${days}d since touched`}
            {isStale(dream) ? " ⚠" : ""}
          </span>
        </div>
      </div>

      {(emotion?.story || emotion?.emotional_reason) && (
        <section>
          <p className="eyebrow">The why</p>
          {emotion?.story ? (
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{emotion.story}</p>
          ) : null}
          {emotion?.emotional_reason ? (
            <blockquote className="mt-2.5 border-l-2 border-[rgba(200,162,75,0.5)] pl-3 font-display text-[15px] italic leading-relaxed text-gold-soft">
              &ldquo;{emotion.emotional_reason}&rdquo;
            </blockquote>
          ) : null}
          {emotion?.feeling ? (
            <p className="mt-2 text-[11.5px] text-faint">Feeling · {emotion.feeling}</p>
          ) : null}
        </section>
      )}

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <KV label="Target" value={dream.target_date ?? "Ongoing"} />
        <KV label="Progress" value={`${dream.progress}%`} />
        <KV label="Need" value={target ? formatMoney(target, currency, { compact: true }) : "—"} />
        <KV label="Saved" value={formatMoney(saved, currency, { compact: true })} />
      </section>

      {target > 0 ? (
        <section>
          <div className="mb-1.5 flex items-center justify-between text-[11.5px] text-muted">
            <span>Savings</span>
            <span className="tnum">
              {formatMoney(saved, currency, { compact: true })} / {formatMoney(target, currency, { compact: true })} · {pct(saved, target)}%
            </span>
          </div>
          <Progress value={pct(saved, target)} />
          <form action={addSavingAction} className="mt-2.5 flex flex-wrap items-end gap-2">
            <input type="hidden" name="dream_id" value={dream.id} />
            <div className="min-w-[120px] flex-1">
              <Label htmlFor={`amount-${dream.id}`}>Add saving (major)</Label>
              <Input id={`amount-${dream.id}`} name="amount" inputMode="decimal" placeholder="5000" />
            </div>
            <div className="min-w-[140px] flex-1">
              <Label htmlFor={`note-${dream.id}`}>Note</Label>
              <Input id={`note-${dream.id}`} name="note" placeholder="Freelance payment" />
            </div>
            <Button type="submit" size="sm" variant="outline">Add</Button>
          </form>
        </section>
      ) : null}

      <section>
        <div className="flex items-center justify-between">
          <p className="eyebrow">Milestones</p>
          <span className="text-[11px] text-faint">
            {doneMilestones.length}/{dream.milestones?.length ?? 0} done
          </span>
        </div>
        <ul className="mt-2 space-y-1.5">
          {(dream.milestones ?? [])
            .slice()
            .sort((a, b) => Number(a.done) - Number(b.done) || a.sort - b.sort)
            .map((m) => (
              <li key={m.id} className="flex items-center gap-2.5">
                <form action={toggleMilestoneAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="dream_id" value={dream.id} />
                  <input type="hidden" name="done" value={String(!m.done)} />
                  <button
                    type="submit"
                    aria-label={m.done ? `Reopen ${m.title}` : `Complete ${m.title}`}
                    className={`grid h-[18px] w-[18px] place-items-center rounded-md border-[1.5px] transition-colors ${
                      m.done
                        ? "border-green bg-green text-[#07120d]"
                        : "border-faint text-transparent hover:border-green"
                    }`}
                  >
                    <Check size={11} strokeWidth={3} aria-hidden />
                  </button>
                </form>
                <span className={`flex-1 text-[13px] ${m.done ? "text-muted line-through" : ""}`}>
                  {m.title}
                </span>
                <form action={removeMilestoneAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="dream_id" value={dream.id} />
                  <button type="submit" aria-label={`Remove ${m.title}`} className="text-faint hover:text-red">
                    <X size={12} aria-hidden />
                  </button>
                </form>
              </li>
            ))}
        </ul>
        <form action={addMilestoneAction} className="mt-2 flex items-center gap-2">
          <input type="hidden" name="dream_id" value={dream.id} />
          <Input name="title" placeholder="Add a milestone…" maxLength={140} className="h-9" />
          <Button type="submit" size="sm" variant="outline" aria-label="Add milestone">
            <Plus size={14} aria-hidden />
          </Button>
        </form>
      </section>

      <section className="dashed-gold px-3.5 py-3 text-[13px]">
        <span className="font-semibold text-gold-soft">Next: </span>
        {next}
      </section>

      {(dream.images ?? []).length > 0 ? (
        <section>
          <p className="eyebrow">Gallery</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(dream.images ?? []).map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption ?? ""} className="h-full w-full object-cover" />
                <form action={removeImageAction} className="absolute right-1 top-1">
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="dream_id" value={dream.id} />
                  <button
                    type="submit"
                    aria-label="Remove image"
                    className="grid h-6 w-6 place-items-center rounded-full bg-[rgba(10,10,11,0.75)] text-muted opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={12} aria-hidden />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-wrap items-center gap-2">
        <ImageUploader dreamId={dream.id} />
        <form action={addImageAction} className="flex items-center gap-2">
          <input type="hidden" name="dream_id" value={dream.id} />
          <Input name="url" placeholder="Paste image URL" className="h-9 w-[190px]" />
          <Button type="submit" size="sm" variant="outline">Add</Button>
        </form>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dreams?open=${dream.id}&edit=1`}>Edit</Link>
          </Button>
          {dream.status !== "active" ? (
            <span className="self-center text-[11.5px] uppercase tracking-[0.1em] text-faint">{dream.status}</span>
          ) : null}
        </div>
        <DeleteDreamButton dreamId={dream.id} />
      </section>

      <details className="rounded-lg border border-border bg-surface-2 px-3 py-2">
        <summary className="cursor-pointer text-[12px] text-muted">Edit the emotional anchor alone</summary>
        <form action={setEmotionAction} className="mt-3 space-y-2">
          <input type="hidden" name="dream_id" value={dream.id} />
          <Input name="story" defaultValue={emotion?.story ?? ""} placeholder="Why you want it" />
          <Input name="emotional_reason" defaultValue={emotion?.emotional_reason ?? ""} placeholder="Raw reason" />
          <Input name="feeling" defaultValue={emotion?.feeling ?? ""} placeholder="Feeling" />
          <Button type="submit" size="sm" variant="outline">Save anchor</Button>
        </form>
      </details>
    </div>
  );
}
