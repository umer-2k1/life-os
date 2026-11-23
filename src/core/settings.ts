import { getDataSource } from "@/db/data-source";
import { AiSettings, NotificationPrefs } from "@/db/entities";
import { decrypt, encrypt, maskSecret } from "@/lib/crypto";
import { env } from "@/lib/env";
import { AppError } from "./errors";
import { ensureBootstrap } from "./bootstrap";

export type Provider = "openrouter" | "groq" | "grok" | "deepseek";

export const PROVIDERS: Provider[] = ["openrouter", "groq", "grok", "deepseek"];

export const PROVIDER_INFO: Record<
  Provider,
  { label: string; env: string; hint: string }
> = {
  openrouter: { label: "OpenRouter", env: "OPENROUTER_API_KEY", hint: "Free models first" },
  groq: { label: "Groq", env: "GROQ_API_KEY", hint: "Fast fallback + Whisper" },
  grok: { label: "Grok (xAI)", env: "XAI_API_KEY", hint: "Optional" },
  deepseek: { label: "DeepSeek", env: "DEEPSEEK_API_KEY", hint: "Optional" },
};

export async function getAiSettings() {
  await ensureBootstrap();
  const ds = await getDataSource();
  return ds.getRepository(AiSettings).findOneBy({ user_id: env().OWNER_USER_ID });
}

export async function updateAiSettings(input: {
  provider_order?: string[];
  selected_model?: string | null;
  keys?: Record<string, string>;
}) {
  const row = await getAiSettings();
  if (!row) throw new AppError("NOT_FOUND", "AI settings not found.");
  const ds = await getDataSource();
  if (input.provider_order) row.provider_order = input.provider_order;
  if (input.selected_model !== undefined) row.selected_model = input.selected_model;
  if (input.keys) {
    const next = { ...(row.keys ?? {}) };
    for (const [provider, value] of Object.entries(input.keys)) {
      if (!value) continue;
      next[provider] = encrypt(value);
    }
    row.keys = next;
  }
  return ds.getRepository(AiSettings).save(row);
}

export async function maskedKeys(): Promise<Record<string, string | null>> {
  const row = await getAiSettings();
  const out: Record<string, string | null> = {};
  for (const p of PROVIDERS) {
    const encrypted = row?.keys?.[p];
    const envKey =
      p === "openrouter"
        ? env().OPENROUTER_API_KEY
        : p === "groq"
          ? env().GROQ_API_KEY
          : p === "grok"
            ? env().XAI_API_KEY
            : env().DEEPSEEK_API_KEY;
    let value: string | null = null;
    if (encrypted) {
      try {
        value = decrypt(encrypted);
      } catch {
        value = null;
      }
    }
    if (!value && envKey) value = envKey;
    out[p] = maskSecret(value);
  }
  return out;
}

export async function providerKeys(): Promise<Partial<Record<Provider, string>>> {
  const row = await getAiSettings();
  const out: Partial<Record<Provider, string>> = {};
  const fromEnv: Record<Provider, string | undefined> = {
    openrouter: env().OPENROUTER_API_KEY,
    groq: env().GROQ_API_KEY,
    grok: env().XAI_API_KEY,
    deepseek: env().DEEPSEEK_API_KEY,
  };
  for (const p of PROVIDERS) {
    let key: string | undefined;
    const encrypted = row?.keys?.[p];
    if (encrypted) {
      try {
        key = decrypt(encrypted);
      } catch {
        key = undefined;
      }
    }
    out[p] = key || fromEnv[p];
  }
  return out;
}

export async function getNotificationPrefs() {
  await ensureBootstrap();
  const ds = await getDataSource();
  let row = await ds
    .getRepository(NotificationPrefs)
    .findOneBy({ user_id: env().OWNER_USER_ID });
  if (!row) {
    row = await ds.getRepository(NotificationPrefs).save(
      ds.getRepository(NotificationPrefs).create({
        user_id: env().OWNER_USER_ID,
        channels: { telegram: true, web: true, email: false },
      }),
    );
  }
  return row;
}

export async function updateNotificationPrefs(input: {
  daily_ask_time?: string;
  reask_gap_hours?: number;
  quiet_start?: string;
  quiet_end?: string;
  channels?: Record<string, boolean>;
  push_enabled?: boolean;
}) {
  const row = await getNotificationPrefs();
  const ds = await getDataSource();
  Object.assign(row, input);
  return ds.getRepository(NotificationPrefs).save(row);
}
