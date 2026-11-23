import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "gold" | "green" | "amber" | "red" | "muted";

const tones: Record<Tone, string> = {
  gold: "border-[rgba(200,162,75,0.35)] bg-[rgba(200,162,75,0.10)] text-gold-soft",
  green: "border-[rgba(63,182,139,0.3)] bg-[rgba(63,182,139,0.10)] text-green",
  amber: "border-[rgba(224,168,46,0.3)] bg-[rgba(224,168,46,0.10)] text-amber",
  red: "border-[rgba(228,86,74,0.3)] bg-[rgba(228,86,74,0.10)] text-red",
  muted: "border-border bg-surface-2 text-muted",
};

export function Badge({
  tone = "muted",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Dot({ tone = "muted", className }: { tone?: Tone; className?: string }) {
  const color =
    tone === "green"
      ? "var(--green)"
      : tone === "amber"
        ? "var(--amber)"
        : tone === "red"
          ? "var(--red)"
          : tone === "gold"
            ? "var(--gold)"
            : "var(--muted)";
  return (
    <span
      className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", className)}
      style={{ background: color }}
    />
  );
}
