import { NextResponse } from "next/server";
import { getMe, getWebhookInfo, setWebhook } from "@/core/telegram/api";
import { errorBody } from "@/core/errors";
import { env } from "@/lib/env";

/** Authenticated read-only status: what Telegram thinks the webhook is. */
export async function GET() {
  try {
    const [bot, webhook] = await Promise.all([getMe(), getWebhookInfo()]);
    return NextResponse.json({
      ok: webhook.url.endsWith("/api/telegram") && !webhook.last_error_message,
      bot,
      webhook,
    });
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}

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
