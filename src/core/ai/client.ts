import type { z } from "zod";
import { AppError } from "../errors";
import { getAiSettings, providerKeys, PROVIDERS, type Provider } from "../settings";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type ProviderConfig = {
  url: string;
  defaultModel: string;
  headers: (key: string) => Record<string, string>;
};

const OPENROUTER_DEFAULT = "meta-llama/llama-3.3-70b-instruct:free";

const CONFIG: Record<Provider, ProviderConfig> = {
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: OPENROUTER_DEFAULT,
    headers: (key) => ({
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
      "X-Title": "Life OS",
    }),
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "openai/gpt-oss-120b",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  grok: {
    url: "https://api.x.ai/v1/chat/completions",
    defaultModel: "grok-3-mini",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  deepseek: {
    url: "https://api.deepseek.com/chat/completions",
    defaultModel: "deepseek-chat",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
};

let freeModelCache: { id: string; at: number } | null = null;

async function openRouterFreeModel(): Promise<string> {
  if (freeModelCache && Date.now() - freeModelCache.at < 60 * 60_000) {
    return freeModelCache.id;
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return OPENROUTER_DEFAULT;
    const data = (await res.json()) as {
      data?: Array<{ id: string; pricing?: { prompt?: string; completion?: string } }>;
    };
    const free = (data.data ?? []).filter(
      (m) =>
        m.id.endsWith(":free") ||
        (m.pricing?.prompt === "0" && m.pricing?.completion === "0"),
    );
    const preferred =
      free.find((m) => /llama-3\.3-70b-instruct/.test(m.id)) ??
      free.find((m) => /qwen.*instruct/.test(m.id)) ??
      free.find((m) => /deepseek/.test(m.id)) ??
      free[0];
    if (preferred) {
      freeModelCache = { id: preferred.id, at: Date.now() };
      return preferred.id;
    }
  } catch {
    // fall through to default
  }
  return OPENROUTER_DEFAULT;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function callProvider(
  provider: Provider,
  key: string,
  model: string | null,
  messages: ChatMessage[],
  temperature: number,
): Promise<string> {
  const cfg = CONFIG[provider];
  const chosenModel =
    provider === "openrouter"
      ? model || (await openRouterFreeModel())
      : cfg.defaultModel;

  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { "content-type": "application/json", ...cfg.headers(key) },
    cache: "no-store",
    signal: AbortSignal.timeout(45_000),
    body: JSON.stringify({
      model: chosenModel,
      temperature,
      messages,
      response_format: { type: "json_object" },
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new AppError(
      "AI_UNAVAILABLE",
      `${provider} ${res.status}: ${detail.slice(0, 160)}`,
    );
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content) throw new AppError("AI_UNAVAILABLE", `${provider} returned no text.`);
  return content;
}

export type JsonRequest<T> = {
  messages: ChatMessage[];
  schema: z.ZodType<T>;
  temperature?: number;
  label: string;
};

/**
 * Try providers in the configured order until one returns schema-valid JSON.
 * Falls back to a single retry per provider on malformed output.
 */
export async function chatJson<T>({ messages, schema, temperature = 0.3, label }: JsonRequest<T>): Promise<{
  data: T;
  provider: Provider;
  model: string;
}> {
  const settings = await getAiSettings();
  const keys = await providerKeys();
  const order = ((settings?.provider_order ?? ["openrouter", "groq", "grok", "deepseek"]) as Provider[]).filter(
    (p) => PROVIDERS.includes(p),
  );
  const available = order.filter((p) => keys[p]);
  if (!available.length) {
    throw new AppError("AI_UNAVAILABLE", "No AI key configured.");
  }

  let lastError = "AI unavailable";
  for (const provider of available) {
    const key = keys[provider]!;
    const selected = settings?.selected_model ?? null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const content = await callProvider(
          provider,
          key,
          selected,
          attempt === 0
            ? messages
            : [...messages, { role: "user", content: "Return valid JSON only. No prose, no markdown." }],
          temperature,
        );
        const parsed = extractJson(content);
        const result = schema.safeParse(parsed);
        if (result.success) {
          return { data: result.data, provider, model: selected ?? provider };
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        break;
      }
    }
  }
  console.error(`[ai:${label}] failed:`, lastError);
  throw new AppError("AI_UNAVAILABLE", "AI providers failed.");
}

export async function aiAvailable(): Promise<boolean> {
  const keys = await providerKeys();
  return Object.values(keys).some(Boolean);
}

export type FreeModel = { id: string; name: string; context: number | null };

let modelListCache: { at: number; models: FreeModel[] } | null = null;

export async function getFreeModels(): Promise<FreeModel[]> {
  if (modelListCache && Date.now() - modelListCache.at < 60 * 60_000) {
    return modelListCache.models;
  }
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    data?: Array<{
      id: string;
      name?: string;
      context_length?: number;
      pricing?: { prompt?: string; completion?: string };
    }>;
  };
  const models = (data.data ?? [])
    .filter(
      (m) =>
        m.id.endsWith(":free") ||
        (String(m.pricing?.prompt) === "0" && String(m.pricing?.completion) === "0"),
    )
    .map((m) => ({ id: m.id, name: m.name ?? m.id, context: m.context_length ?? null }));
  modelListCache = { at: Date.now(), models };
  return models;
}
