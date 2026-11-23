import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getReport, listReports } from "@/core/reports";
import { AppError } from "@/core/errors";
import { formatRange, todayISO } from "@/lib/dates";
import { env } from "@/lib/env";
import { generateReportAction } from "./actions";
import { ReportBody } from "./report-body";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; error?: string }>;
}) {
  const params = await searchParams;
  const reports = await listReports();
  let selected = null;
  if (params.id) {
    try {
      selected = await getReport(params.id);
    } catch (err) {
      if (!(err instanceof AppError)) throw err;
    }
  }
  if (!selected) selected = reports[0] ?? null;

  const today = todayISO(env().TIMEZONE);

  return (
    <div className="space-y-4 motion-safe:animate-[rise_0.3s_ease_both]">
      <header>
        <p className="eyebrow">Reports</p>
        <h1 className="mt-1 font-display text-2xl">The verdict</h1>
        <p className="mt-1 text-[12.5px] text-muted">
          Weekly by default · emailed when configured · any range on demand.
        </p>
      </header>

      {params.error ? (
        <p className="rounded-lg border border-[rgba(228,86,74,0.35)] bg-[rgba(228,86,74,0.08)] px-3 py-2 text-[12.5px] text-red">
          {params.error}
        </p>
      ) : null}

      <section className="card">
        <p className="eyebrow">Generate</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <form action={generateReportAction}>
            <input type="hidden" name="kind" value="weekly" />
            <Button type="submit" variant="gold" className="w-full">This week</Button>
          </form>
          <form action={generateReportAction}>
            <input type="hidden" name="kind" value="monthly" />
            <Button type="submit" variant="outline" className="w-full">This month</Button>
          </form>
          <form action={generateReportAction} className="flex flex-col gap-2">
            <input type="hidden" name="kind" value="custom" />
            <div className="flex items-center gap-2">
              <Input type="date" name="range_start" aria-label="Start" defaultValue={today} className="h-9" />
              <Input type="date" name="range_end" aria-label="End" defaultValue={today} className="h-9" />
            </div>
            <Button type="submit" variant="outline" className="w-full">Custom range</Button>
          </form>
        </div>
        <p className="mt-3 text-[11.5px] text-faint">
          Email is sent automatically when Resend + OWNER_EMAIL are configured.
        </p>
      </section>

      {selected ? (
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="gold">{selected.kind}</Badge>
                <span className="text-[11.5px] text-faint">
                  {formatRange(selected.range_start, selected.range_end)}
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] text-faint">
                Generated {new Date(selected.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                {selected.emailed_at ? " · emailed" : ""}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href={`/api/reports/${selected.id}/pdf`}>
                <Download size={13} aria-hidden /> PDF
              </a>
            </Button>
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <ReportBody markdown={selected.content_md} />
          </div>
        </section>
      ) : (
        <div className="card py-12 text-center">
          <FileText className="mx-auto text-faint" aria-hidden />
          <p className="mt-3 font-display text-lg">No reports yet.</p>
          <p className="mt-1 text-[12.5px] text-muted">Generate this week — even one logged day is data.</p>
        </div>
      )}

      {reports.length > 1 ? (
        <section>
          <p className="eyebrow mb-2">History</p>
          <ul className="divide-y divide-border rounded-[14px] border border-border bg-surface px-4">
            {reports.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/reports?id=${r.id}`} className="min-w-0">
                  <p className="truncate text-[13px]">
                    <span className="capitalize">{r.kind}</span> · {formatRange(r.range_start, r.range_end)}
                  </p>
                  <p className="text-[11px] text-faint">
                    {new Date(r.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </p>
                </Link>
                <a href={`/api/reports/${r.id}/pdf`} className="text-faint hover:text-gold-soft" aria-label="Download PDF">
                  <Download size={14} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="pb-2 text-center text-[11px] text-faint">
        Also available from Telegram and any MCP client.
      </p>
    </div>
  );
}
