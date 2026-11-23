import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Minor units → pretty number, no currency symbol. */
export function minorToNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  return Number(value) / 100;
}

/** Minor units → localized currency string. */
export function formatMoney(
  minor: string | number | null | undefined,
  currency = "PKR",
  opts: { compact?: boolean; decimals?: number } = {},
): string {
  const amount = minorToNumber(minor);
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      notation: opts.compact ? "compact" : "standard",
      maximumFractionDigits: opts.decimals ?? (opts.compact ? 1 : 0),
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en")}`;
  }
}

/** Bare number with grouping, for hero displays. */
export function formatNumber(value: number, opts: { compact?: boolean } = {}): string {
  return new Intl.NumberFormat("en", {
    notation: opts.compact ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Convert a user-entered amount (major units) to integer minor units. */
export function toMinor(input: string | number): string {
  const n = typeof input === "string" ? Number(input.replace(/,/g, "")) : input;
  if (!Number.isFinite(n)) return "0";
  return Math.round(n * 100).toString();
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function pct(n: number, total: number): number {
  if (!total) return 0;
  return clamp(Math.round((n / total) * 100), 0, 100);
}

export function daysBetween(a: string | Date, b: string | Date): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(ms / 86_400_000);
}

export function daysSince(date?: string | Date | null): number | null {
  if (!date) return null;
  return daysBetween(date, new Date());
}

export function initials(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
