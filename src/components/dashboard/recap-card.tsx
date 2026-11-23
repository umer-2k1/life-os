import Link from "next/link";

function tag(text: string): { label: string; className: string } {
  if (text.startsWith("🟢")) return { label: "ON", className: "text-green bg-[rgba(63,182,139,0.12)]" };
  if (text.startsWith("🔴")) return { label: "WASTE", className: "text-red bg-[rgba(228,86,74,0.12)]" };
  return { label: "NEU", className: "text-amber bg-[rgba(224,168,46,0.12)]" };
}

function clean(text: string) {
  return text.replace(/^[🟢🔴🟡]\s*/u, "");
}

export function RecapCard({
  bullets,
  next,
  date,
}: {
  bullets: string[];
  next: string | null;
  date: string;
}) {
  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Last check-in</p>
        <Link href="/activity" className="text-[11.5px] text-faint hover:text-gold-soft">
          Open board →
        </Link>
      </div>

      {bullets.length === 0 ? (
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Nothing logged yet. The first line is always the hardest.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {bullets.slice(0, 5).map((b, i) => {
            const t = tag(b);
            const isWaste = t.label === "WASTE";
            return (
              <li key={i} className="flex items-start gap-2.5 py-2">
                <span
                  className={`mt-0.5 flex-none rounded-[6px] px-1.5 py-0.5 text-[10px] font-bold tracking-[0.05em] ${t.className}`}
                >
                  {t.label}
                </span>
                <span className={`text-[13px] leading-snug ${isWaste ? "text-muted" : "text-fg"}`}>
                  {clean(b)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {next ? (
        <div className="dashed-gold mt-3 px-3.5 py-2.5 text-[13px] leading-snug text-muted">
          <b className="text-gold-soft">Next:</b> {next}
        </div>
      ) : null}
      <p className="mt-2 text-[11px] text-faint">{date}</p>
    </section>
  );
}
