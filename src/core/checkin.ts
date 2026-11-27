import { getDataSource } from "@/db/data-source";
import { TelegramLink } from "@/db/entities";
import { addDaysISO, todayISO } from "@/lib/dates";
import { ensureDailyLog, markAsked, pendingCheckin } from "./logs";
import { getProfile } from "./profile";
import { getNotificationPrefs } from "./settings";
import { sendDailyAsk } from "./telegram/handler";

function localMinutes(timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function inQuietHours(now: number, start: string, end: string): boolean {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === e) return false;
  if (s < e) return now >= s && now < e;
  return now >= s || now < e;
}

/**
 * Which day the open check-in is about.
 * Ask before noon -> yesterday (the day that just ended).
 * Ask in the evening -> today.
 */
export async function currentCheckinDate(): Promise<string> {
  const [prefs, profile] = await Promise.all([getNotificationPrefs(), getProfile()]);
  const today = todayISO(profile.timezone);
  return toMinutes(prefs.daily_ask_time) < 12 * 60 ? addDaysISO(today, -1) : today;
}

/** Date a reply should be logged to: the open check-in, otherwise today. */
export async function resolveCheckinDate(date?: string): Promise<string | undefined> {
  if (date) return date;
  const target = await currentCheckinDate();
  const pending = await pendingCheckin(target);
  return pending.open ? pending.date : undefined;
}

export type CronResult = {
  action: "answered" | "not-due" | "asked" | "re-asked" | "no-telegram" | "quiet";
  date: string;
};

/**
 * Hourly: daily ask at the configured time, then re-ask every N hours until any
 * channel answers. First answer closes it everywhere.
 */
export async function runCheckinCron(): Promise<CronResult> {
  const [prefs, profile] = await Promise.all([getNotificationPrefs(), getProfile()]);
  const today = todayISO(profile.timezone);
  // A midnight/morning ask reviews the day that ended, not the one starting.
  const date =
    toMinutes(prefs.daily_ask_time) < 12 * 60 ? addDaysISO(today, -1) : today;
  const log = await ensureDailyLog(date);

  if (log.answered) return { action: "answered", date };

  const ds = await getDataSource();
  const link = await ds.getRepository(TelegramLink).findOne({ where: {} });
  if (!link) return { action: "no-telegram", date };

  const nowMinutes = localMinutes(profile.timezone);
  const askAt = toMinutes(prefs.daily_ask_time);

  if (!log.asked_at) {
    if (nowMinutes < askAt) return { action: "not-due", date };
    const pending = await pendingCheckin(date);
    await sendDailyAsk(link.chat_id, pending.question);
    await markAsked(date);
    return { action: "asked", date };
  }

  if (inQuietHours(nowMinutes, prefs.quiet_start, prefs.quiet_end)) {
    return { action: "quiet", date };
  }

  const last = log.last_ping_at ? new Date(log.last_ping_at).getTime() : 0;
  const gapMs = Math.max(1, prefs.reask_gap_hours) * 3_600_000;
  if (Date.now() - last < gapMs) return { action: "not-due", date };

  const pending = await pendingCheckin(date);
  await sendDailyAsk(link.chat_id, `Still waiting. ${pending.question}`);
  await markAsked(date);
  return { action: "re-asked", date };
}
