import Link from "next/link";
import type { Profile } from "@/db/entities";
import { formatMoney } from "@/lib/utils";

export function NorthStarCard({ profile }: { profile: Profile }) {
  const amount = Number(profile.north_star_amount ?? 0);

  return (
    <section className="card relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.16),transparent_70%)]"
      />
      <p className="eyebrow">North Star</p>
      <p className="mt-2 font-display text-[clamp(34px,7vw,52px)] leading-none tracking-[-0.5px] text-gold-soft">
        {amount > 0 ? formatMoney(amount, profile.currency, { compact: true }) : "—"}
      </p>
      <p className="mt-1 text-[12.5px] text-muted">
        {profile.north_star_label || `${profile.currency} net worth`}
      </p>
      <div className="mt-3.5 border-t border-border pt-3.5 text-[13.5px] text-muted">
        <b className="font-semibold text-fg">
          {profile.identity_line || "I'm becoming someone who closes clients."}
        </b>
      </div>
      <Link
        href="/settings"
        className="mt-2 inline-block text-[11.5px] text-faint underline-offset-2 hover:text-gold-soft hover:underline"
      >
        Set your number and identity →
      </Link>
    </section>
  );
}
