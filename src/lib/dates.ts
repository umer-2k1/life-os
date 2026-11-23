import { formatInTimeZone } from "date-fns-tz";

export const ISO_DATE = "yyyy-MM-dd";

export function todayISO(timezone?: string): string {
  return formatInTimeZone(new Date(), timezone ?? "Asia/Karachi", ISO_DATE);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function startOfWeekISO(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday start
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function rangeDays(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  for (let i = 0; i < 400; i++) {
    out.push(cur);
    if (cur >= end) break;
    cur = addDaysISO(cur, 1);
  }
  return out;
}

export function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

export function formatRange(start: string, end: string): string {
  const s = new Date(`${start}T12:00:00Z`);
  const e = new Date(`${end}T12:00:00Z`);
  const sameYear = s.getFullYear() === e.getFullYear();
  const left = s.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const right = e.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${left} – ${right}`;
}

export function monthName(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function isWeekend(iso: string): boolean {
  const day = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}
