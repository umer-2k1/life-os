import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-[10px] border border-border bg-surface-2 px-3 py-2 text-sm text-fg placeholder:text-faint transition-colors focus-visible:border-[rgba(200,162,75,0.5)] focus-visible:outline-none disabled:opacity-50";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn(base, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(base, "min-h-24 resize-y leading-relaxed", className)} {...props} />;
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint", className)}
      {...props}
    />
  );
}

export function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(base, "h-10 appearance-none pr-8", className)}
      {...props}
    />
  );
}
