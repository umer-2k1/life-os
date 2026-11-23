import "server-only";

import { z } from "zod";

/**
 * Runtime environment. All values are read lazily so that a missing optional
 * key never crashes a route that does not use it.
 */
const schema = z.object({
  APP_URL: z.string().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  TIMEZONE: z.string().default("Asia/Karachi"),
  CURRENCY: z.string().default("PKR"),
  OWNER_EMAIL: z.string().optional(),
  OWNER_USER_ID: z.string().default("00000000-0000-4000-8000-000000000001"),

  APP_PASSWORD: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(16).optional(),

  DATABASE_URL: z.string().optional(),
  DATABASE_SSL: z
    .string()
    .optional()
    .transform((v) => v === "true"),

  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("lifeos"),

  OPENROUTER_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  REPORT_FROM_EMAIL: z.string().optional(),

  CRON_SHARED_SECRET: z.string().optional(),
  MCP_AUTH_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error("[env] invalid environment", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment");
  }
  cached = parsed.data;
  return cached;
}

export const hasSupabaseStorage = () =>
  Boolean(env().NEXT_PUBLIC_SUPABASE_URL && env().SUPABASE_SERVICE_ROLE_KEY);

export const hasAI = () =>
  Boolean(env().OPENROUTER_API_KEY || env().GROQ_API_KEY || env().XAI_API_KEY || env().DEEPSEEK_API_KEY);

export const hasTelegram = () => Boolean(env().TELEGRAM_BOT_TOKEN);

export const hasResend = () => Boolean(env().RESEND_API_KEY && env().REPORT_FROM_EMAIL);
