import { NextResponse } from "next/server";
import { getMe, setWebhook } from "@/core/telegram/api";
import { errorBody } from "@/core/errors";
import { env } from "@/lib/env";

/** Authenticated helper: register the Telegram webhook for this deployment. */
export async function POST() {
  try {
    if (!env().TELEGRAM_BOT_TOKEN || !env().TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Telegram token/secret missing." } },
        { status: 400 },
      );
    }
    const me = await getMe();
    await setWebhook();
    return NextResponse.json({
      ok: true,
      bot: me,
      url: `${env().APP_URL.replace(/\/$/, "")}/api/telegram`,
    });
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}
