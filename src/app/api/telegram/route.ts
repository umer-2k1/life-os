import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { handleUpdate } from "@/core/telegram/handler";

export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({ ok: true, webhook: true });
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!env().TELEGRAM_WEBHOOK_SECRET || secret !== env().TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Bad webhook secret." } },
      { status: 401 },
    );
  }

  try {
    const update = await req.json();
    await handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram webhook]", err);
    return NextResponse.json({ ok: true });
  }
}
