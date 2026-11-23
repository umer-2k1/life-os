import { env } from "@/lib/env";
import { AppError } from "../errors";

const API = "https://api.telegram.org";

function token(): string {
  const t = env().TELEGRAM_BOT_TOKEN;
  if (!t) throw new AppError("BAD_REQUEST", "Telegram bot token is not set.");
  return t;
}

async function call<T>(method: string, payload?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await res.json().catch(() => null)) as
    | { ok: boolean; result?: T; description?: string }
    | null;
  if (!res.ok || !data?.ok) {
    throw new AppError("INTERNAL", data?.description ?? `Telegram ${method} failed.`);
  }
  return data.result as T;
}

export async function sendMessage(
  chatId: string | number,
  text: string,
  extra: Record<string, unknown> = {},
): Promise<void> {
  await call("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
    ...extra,
  });
}

export async function setWebhook(): Promise<{ ok: boolean; description?: string }> {
  const url = `${env().APP_URL.replace(/\/$/, "")}/api/telegram`;
  return call("setWebhook", {
    url,
    secret_token: env().TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });
}

export async function deleteWebhook(): Promise<void> {
  await call("deleteWebhook");
}

export async function getMe(): Promise<{ id: number; username?: string }> {
  return call("getMe");
}

export type WebhookInfo = {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  ip_address?: string;
};

export async function getWebhookInfo(): Promise<WebhookInfo> {
  return call("getWebhookInfo");
}

export async function downloadFile(fileId: string): Promise<{ buffer: Buffer; filename: string }> {
  const file = await call<{ file_path: string }>("getFile", { file_id: fileId });
  const res = await fetch(`${API}/file/bot${token()}/${file.file_path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new AppError("INTERNAL", "Could not download the voice note.");
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    filename: file.file_path.split("/").pop() ?? "voice.ogg",
  };
}

export async function transcribeAudio(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const key = env().GROQ_API_KEY;
  if (!key) throw new AppError("BAD_REQUEST", "GROQ_API_KEY is required for voice notes.");

  // Groq rejects Telegram's ".oga"; send it as OGG explicitly.
  const supported = /\.(flac|mp3|mp4|mpeg|mpga|m4a|ogg|opus|wav|webm)$/i.test(filename);
  const safeName = supported ? filename.replace(/\.oga$/i, ".ogg") : "voice.ogg";

  const form = new FormData();
  form.set("model", "whisper-large-v3");
  form.set("response_format", "text");
  form.set("file", new Blob([new Uint8Array(buffer)], { type: "audio/ogg" }), safeName);

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[whisper]", res.status, detail.slice(0, 200));
    throw new AppError("INTERNAL", "Voice transcription failed. Try text.");
  }
  return (await res.text()).trim();
}
