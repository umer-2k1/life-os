import { NextResponse } from "next/server";
import { errorBody } from "@/core/errors";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { verifyPin } from "@/core/security";
import { env } from "@/lib/env";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const limit = rateLimit(`login:${ip}`, 8, 10 * 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many attempts." } },
        { status: 429 },
      );
    }
    const { pin } = (await req.json().catch(() => ({}))) as { pin?: string };
    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "PIN must be 6 digits." } },
        { status: 400 },
      );
    }
    if (!(await verifyPin(pin))) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Wrong PIN." } },
        { status: 401 },
      );
    }
    resetRateLimit(`login:${ip}`);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await createSessionToken(env().OWNER_USER_ID), sessionCookieOptions());
    return res;
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}
