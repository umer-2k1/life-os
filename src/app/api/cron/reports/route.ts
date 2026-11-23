import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { errorBody } from "@/core/errors";
import { runReportsCron } from "@/core/reports";

export const maxDuration = 120;

function authorized(req: Request): boolean {
  const secret = env().CRON_SHARED_SECRET;
  if (!secret) return false;
  return (
    req.headers.get("x-cron-secret") === secret ||
    req.headers.get("authorization") === `Bearer ${secret}`
  );
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Bad cron secret." } },
      { status: 401 },
    );
  }
  try {
    return NextResponse.json(await runReportsCron());
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
