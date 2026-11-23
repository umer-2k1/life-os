import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Resend } from "resend";
import type { Activity, Dream, Report } from "@/db/entities";
import { getDataSource } from "@/db/data-source";
import { Report as ReportEntity } from "@/db/entities";
import { env } from "@/lib/env";
import { addDaysISO, formatRange, todayISO } from "@/lib/dates";
import { AppError } from "./errors";
import { activitiesBetween } from "./activities";
import { listDreams } from "./dreams";
import { scoreRange } from "./scores";
import { savingsRollup } from "./savings";
import { aiAvailable, chatJson } from "./ai/client";
import { reportPrompt, systemPreamble } from "./ai/prompts";
import { getProfile } from "./profile";
import { z } from "zod";

const narrativeSchema = z.object({
  headline: z.string(),
  trend: z.enum(["up", "flat", "down"]),
  trajectory: z.array(
    z.object({
      dream: z.string(),
      now: z.string(),
      was: z.string(),
      stalled: z.boolean(),
    }),
  ),
  wins: z.array(z.object({ points: z.number(), text: z.string() })),
  waste: z.array(z.object({ text: z.string(), days_added: z.number() })),
  money: z.string(),
  fix_one_thing: z.string(),
  next_focus: z.array(z.string()).default([]),
});

export type ReportNarrative = z.infer<typeof narrativeSchema>;

export function defaultRange(kind: "weekly" | "monthly" | "custom"): { start: string; end: string } {
  const today = todayISO(env().TIMEZONE);
  if (kind === "weekly") {
    const d = new Date(`${today}T12:00:00Z`);
    const diff = (d.getUTCDay() + 6) % 7;
    return { start: addDaysISO(today, -diff), end: today };
  }
  if (kind === "monthly") {
    return { start: `${today.slice(0, 7)}-01`, end: today };
  }
  return { start: addDaysISO(today, -6), end: today };
}

function yearsLabel(remaining: number, pointsPerWeek: number): string | null {
  if (pointsPerWeek <= 0) return null;
  const weeks = remaining / pointsPerWeek;
  if (weeks <= 0) return "done";
  if (weeks < 8) return `~${Math.ceil(weeks)} wks`;
  if (weeks < 78) return `~${(weeks / 4.33).toFixed(1)} mo`;
  return `~${(weeks / 52).toFixed(1)} yrs`;
}

function countDream(activities: Activity[], dreamId: string, from: string, to: string): number {
  return activities.filter(
    (a) =>
      a.dream_id === dreamId &&
      a.relevance === "on_track" &&
      (a.activity_date ?? from) >= from &&
      (a.activity_date ?? to) <= to,
  ).length;
}

export async function buildNarrative(input: {
  kind: string;
  start: string;
  end: string;
  dreams: Dream[];
  activities: Activity[];
  scores: { day: string; score: number }[];
}): Promise<ReportNarrative> {
  const { kind, start, end, dreams, activities, scores } = input;
  const days = Math.max(1, Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1);
  const prevStart = addDaysISO(start, -days);
  const prevEnd = addDaysISO(start, -1);
  const prevActivities = await activitiesBetween(prevStart, prevEnd);

  const avg = scores.length
    ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length)
    : 0;
  const prevScores = await scoreRange(prevStart, prevEnd);
  const prevAvg = prevScores.length
    ? Math.round(prevScores.reduce((s, x) => s + x.score, 0) / prevScores.length)
    : avg;
  const trend: ReportNarrative["trend"] = avg >= prevAvg + 5 ? "up" : avg <= prevAvg - 5 ? "down" : "flat";

  const trajectory = dreams.map((d) => {
    const remaining = Math.max(0, 100 - d.progress);
    const nowPoints = countDream(activities, d.id, start, end);
    const wasPoints = countDream(prevActivities, d.id, prevStart, prevEnd);
    const now = yearsLabel(remaining, nowPoints / (days / 7));
    const was = yearsLabel(remaining, wasPoints / (days / 7));
    return {
      dream: d.title,
      now: now ?? "stalled",
      was: was ?? "stalled",
      stalled: !now,
    };
  });

  const onTrack = activities.filter((a) => a.relevance === "on_track");
  const waste = activities.filter((a) => a.relevance === "waste");
  const wins = onTrack.slice(0, 5).map((a) => ({
    points: Math.max(1, a.score_delta),
    text: a.text,
  }));
  const wasteLines = waste.slice(0, 5).map((a) => ({
    text: a.text,
    days_added: Number(a.time_cost_days ?? 0),
  }));

  const fallback: ReportNarrative = {
    headline:
      scores.length === 0
        ? "No scores in this range. Log a few days first."
        : `Average ${avg}/100 · ${onTrack.length} on-track · ${waste.length} waste`,
    trend,
    trajectory,
    wins,
    waste: wasteLines,
    money: "See savings rollup on the dashboard.",
    fix_one_thing:
      wasteLines[0]?.text
        ? `Kill "${wasteLines[0].text}" first.`
        : "Add one measurable on-track action tomorrow.",
    next_focus: [],
  };

  if (!(await aiAvailable())) return fallback;

  try {
    const profile = await getProfile();
    const { data } = await chatJson({
      label: "report",
      schema: narrativeSchema,
      temperature: 0.5,
      messages: [
        { role: "system", content: systemPreamble(profile, dreams) },
        {
          role: "user",
          content: reportPrompt({
            kind,
            start,
            end,
            scores,
            activities: activities.map((a) => ({
              text: a.text,
              relevance: a.relevance,
              days: a.time_cost_days,
            })),
            savings: await savingsRollup(),
          }),
        },
      ],
    });
    return data;
  } catch (err) {
    console.warn("[ai:report]", err);
    return fallback;
  }
}

export function toMarkdown(n: ReportNarrative, input: { kind: string; start: string; end: string }): string {
  const lines: string[] = [];
  lines.push(`# ${input.kind[0].toUpperCase()}${input.kind.slice(1)} report · ${formatRange(input.start, input.end)}`);
  lines.push("");
  lines.push(`**${n.headline}**  `);
  lines.push(`Trend: ${n.trend}`);
  lines.push("");
  lines.push("## Trajectory");
  for (const t of n.trajectory) {
    lines.push(`- ${t.dream}: ${t.now} (was ${t.was})${t.stalled ? " · stalled" : ""}`);
  }
  lines.push("");
  lines.push("## Wins");
  for (const w of n.wins) lines.push(`- ${w.text} (+${w.points})`);
  if (!n.wins.length) lines.push("- None recorded. That's the report.");
  lines.push("");
  lines.push("## Waste");
  for (const w of n.waste) lines.push(`- ${w.text} → ${w.days_added} days added`);
  if (!n.waste.length) lines.push("- None. Keep it that way.");
  lines.push("");
  lines.push("## Money");
  lines.push(n.money);
  lines.push("");
  lines.push("## Fix one thing");
  lines.push(`- ${n.fix_one_thing}`);
  if (n.next_focus.length) {
    lines.push("");
    lines.push("## Next focus");
    for (const f of n.next_focus.slice(0, 5)) lines.push(`- ${f}`);
  }
  return lines.join("\n");
}

export async function generateReport(input: {
  kind: "weekly" | "monthly" | "custom";
  start?: string;
  end?: string;
  email?: boolean;
}): Promise<Report> {
  const range = defaultRange(input.kind);
  const start = input.start ?? range.start;
  const end = input.end ?? range.end;
  if (start > end) throw new AppError("BAD_REQUEST", "Range start is after end.");

  const [dreams, activities, scores] = await Promise.all([
    listDreams({}),
    activitiesBetween(start, end),
    scoreRange(start, end),
  ]);

  const narrative = await buildNarrative({
    kind: input.kind,
    start,
    end,
    dreams,
    activities,
    scores,
  });
  const content_md = toMarkdown(narrative, { kind: input.kind, start, end });

  const ds = await getDataSource();
  const repo = ds.getRepository(ReportEntity);
  const report = await repo.save(
    repo.create({
      user_id: env().OWNER_USER_ID,
      kind: input.kind,
      range_start: start,
      range_end: end,
      content_md,
      content_json: narrative,
      pdf_url: null,
    }),
  );

  if (input.email) {
    try {
      await emailReport(report);
    } catch (err) {
      console.warn("[report email]", err);
    }
  }
  return report;
}

export async function listReports(): Promise<Report[]> {
  const ds = await getDataSource();
  return ds.getRepository(ReportEntity).find({
    where: { user_id: env().OWNER_USER_ID },
    order: { created_at: "DESC" },
    take: 50,
  });
}

export async function getReport(id: string): Promise<Report> {
  const ds = await getDataSource();
  const report = await ds.getRepository(ReportEntity).findOneBy({
    id,
    user_id: env().OWNER_USER_ID,
  });
  if (!report) throw new AppError("NOT_FOUND", "Report not found.");
  return report;
}

/** PDF is generated on demand — no blob storage required. */
export async function reportPdf(report: Report): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const addPage = () => {
    const p = doc.addPage([595, 842]);
    p.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.04, 0.04, 0.05) });
    return p;
  };
  let page = addPage();
  const margin = 54;
  let y = 790;

  const ascii = (s: string) =>
    s
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/[^\x20-\x7E]/g, "");

  function line(text: string, opts: { size?: number; bold?: boolean; color?: [number, number, number] } = {}) {
    const size = opts.size ?? 10.5;
    const weight = opts.bold ? bold : font;
    const words = ascii(text).split(/\s+/);
    let current = "";
    const max = 495;
    const lines: string[] = [];
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (weight.widthOfTextAtSize(next, size) > max) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
    for (const l of lines) {
      if (y < 54) {
        y = 790;
        page = addPage();
      }
      page.drawText(l, {
        x: margin,
        y,
        size,
        font: weight,
        color: opts.color ? rgb(...opts.color) : rgb(0.96, 0.96, 0.95),
      });
      y -= size + 5;
    }
  }

  // Gold title on the dark page.
  line("THE LIFE I'M BUILDING", { size: 10, bold: true, color: [0.78, 0.63, 0.29] });
  line(report.content_md.split("\n")[0].replace(/^#\s*/, ""), { size: 18, bold: true, color: [0.95, 0.95, 0.94] });
  y -= 6;

  for (const raw of report.content_md.split("\n").slice(1)) {
    if (!raw.trim()) {
      y -= 6;
      continue;
    }
    if (raw.startsWith("## ")) {
      y -= 6;
      line(raw.replace(/^##\s*/, "").toUpperCase(), { size: 9.5, bold: true, color: [0.78, 0.63, 0.29] });
    } else if (raw.startsWith("- ")) {
      line(`• ${raw.slice(2)}`, { size: 10 });
    } else {
      line(raw.replace(/\*\*/g, ""));
    }
  }
  return doc.save();
}

function markdownToHtml(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = md
    .split("\n")
    .map((l) => {
      if (l.startsWith("# ")) return `<h1>${esc(l.slice(2))}</h1>`;
      if (l.startsWith("## ")) return `<h2>${esc(l.slice(3))}</h2>`;
      if (l.startsWith("- ")) return `<li>${esc(l.slice(2))}</li>`;
      if (!l.trim()) return "";
      return `<p>${esc(l.replace(/\*\*/g, ""))}</p>`;
    })
    .join("\n")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  return `<div style="background:#0A0A0B;color:#F5F5F4;padding:28px;font-family:Inter,Arial,sans-serif">${body}</div>`;
}

export async function emailReport(report: Report): Promise<void> {
  const key = env().RESEND_API_KEY;
  const from = env().REPORT_FROM_EMAIL;
  const to = env().OWNER_EMAIL;
  if (!key || !from) throw new AppError("BAD_REQUEST", "Resend is not configured.");
  if (!to) throw new AppError("BAD_REQUEST", "OWNER_EMAIL is not set.");

  const resend = new Resend(key);
  const subject = `Life OS · ${report.kind} report · ${formatRange(report.range_start, report.range_end)}`;
  const pdf = await reportPdf(report);

  await resend.emails.send({
    from,
    to,
    subject,
    html: markdownToHtml(report.content_md),
    attachments: [
      {
        filename: `life-os-${report.kind}-${report.range_end}.pdf`,
        content: Buffer.from(pdf).toString("base64"),
      },
    ],
  });

  const ds = await getDataSource();
  await ds.getRepository(ReportEntity).update({ id: report.id }, { emailed_at: new Date() });
}

export async function runReportsCron(): Promise<{ weekly?: string; monthly?: string }> {
  const today = todayISO(env().TIMEZONE);
  const out: { weekly?: string; monthly?: string } = {};
  const isMonday = new Date(`${today}T12:00:00Z`).getUTCDay() === 1;
  const isFirst = today.endsWith("-01");

  if (isMonday) {
    const r = await generateReport({ kind: "weekly", email: true });
    out.weekly = r.id;
  }
  if (isFirst) {
    const r = await generateReport({ kind: "monthly", email: true });
    out.monthly = r.id;
  }
  return out;
}
