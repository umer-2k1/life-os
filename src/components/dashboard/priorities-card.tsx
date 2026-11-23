import { Check, Plus } from "lucide-react";
import type { Activity } from "@/db/entities";
import type { SuggestedPriority } from "@/core/activities";
import { addPriorityAction, completePriorityAction } from "@/app/(app)/actions";

export function PrioritiesCard({
  priorities,
  suggested,
  dreamTitles,
}: {
  priorities: Activity[];
  suggested: SuggestedPriority[];
  dreamTitles: Map<string, string>;
}) {
  const empty = priorities.length === 0 && suggested.length === 0;

  return (
    <section className="card">
      <p className="eyebrow">Today&apos;s 3 priorities</p>

      {empty ? (
        <p className="mt-3 text-[13px] text-muted">
          Add a dream first — then the system picks the single next action.
        </p>
      ) : (
        <ul className="mt-1 divide-y divide-border">
          {priorities.map((p) => (
            <li key={p.id} className="flex items-start gap-3 py-2.5">
              <form action={completePriorityAction}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  aria-label={`Complete ${p.text}`}
                  className="mt-0.5 grid h-[19px] w-[19px] place-items-center rounded-md border-[1.5px] border-faint text-transparent transition-colors hover:border-green hover:text-green"
                >
                  <Check size={12} strokeWidth={3} aria-hidden />
                </button>
              </form>
              <div className="min-w-0">
                <p className={`text-[14px] leading-snug ${p.column === "done" ? "text-muted line-through" : ""}`}>
                  {p.text}
                </p>
                <p className="mt-0.5 text-[11.5px] text-faint">
                  {p.dream_id ? dreamTitles.get(p.dream_id) ?? "—" : "No dream attached"}
                </p>
              </div>
            </li>
          ))}

          {suggested.map((s) => (
            <li key={`${s.dream_id}-${s.text}`} className="flex items-start gap-3 py-2.5">
              <form action={addPriorityAction}>
                <input type="hidden" name="text" value={s.text} />
                <input type="hidden" name="dream_id" value={s.dream_id ?? ""} />
                <button
                  type="submit"
                  aria-label={`Add ${s.text}`}
                  className="mt-0.5 grid h-[19px] w-[19px] place-items-center rounded-md border-[1.5px] border-dashed border-[rgba(200,162,75,0.5)] text-gold-soft transition-colors hover:bg-[rgba(200,162,75,0.12)]"
                >
                  <Plus size={12} strokeWidth={3} aria-hidden />
                </button>
              </form>
              <div className="min-w-0">
                <p className="text-[14px] leading-snug text-muted">{s.text}</p>
                <p className="mt-0.5 text-[11.5px] text-faint">
                  suggested · {s.dream_title ?? "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
