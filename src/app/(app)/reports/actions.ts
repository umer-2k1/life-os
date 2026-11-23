"use server";

import { redirect } from "next/navigation";
import { generateReport } from "@/core/reports";
import { AppError } from "@/core/errors";

export async function generateReportAction(formData: FormData): Promise<void> {
  const kind = String(formData.get("kind") ?? "weekly") as "weekly" | "monthly" | "custom";
  const start = String(formData.get("range_start") ?? "") || undefined;
  const end = String(formData.get("range_end") ?? "") || undefined;
  const email = formData.get("email") === "on";
  try {
    const report = await generateReport({ kind, start, end, email });
    redirect(`/reports?id=${report.id}`);
  } catch (err) {
    if (err instanceof AppError) redirect(`/reports?error=${encodeURIComponent(err.message)}`);
    throw err;
  }
}
