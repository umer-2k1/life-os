import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { DecayAlert } from "@/core/decay";

export function DecayBanner({ alerts }: { alerts: DecayAlert[] }) {
  if (!alerts.length) return null;
  const top = alerts[0];

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-[13px] border border-[rgba(228,86,74,0.35)] bg-[rgba(228,86,74,0.07)] px-4 py-3"
    >
      <AlertTriangle size={18} className="mt-0.5 flex-none text-red" aria-hidden />
      <div className="min-w-0 text-[13.5px]">
        <p className="text-fg">
          <b className="text-red">{top.days} days</b> since you touched{" "}
          <Link href={`/dreams?open=${top.dream.id}`} className="font-medium text-gold-soft underline-offset-2 hover:underline">
            {top.dream.title}
          </Link>
        </p>
        {alerts.length > 1 ? (
          <p className="mt-0.5 text-[12px] text-muted">
            Also decaying:{" "}
            {alerts
              .slice(1, 3)
              .map((a) => `${a.dream.title} (${a.days}d)`)
              .join(" · ")}
          </p>
        ) : (
          <p className="mt-0.5 text-[12px] text-muted">Touching it today is the whole task.</p>
        )}
      </div>
    </div>
  );
}
