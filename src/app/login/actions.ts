"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";
import { env } from "@/lib/env";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { verifyPin } from "@/core/security";

export type LoginState = { error?: string };

async function clientKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const pin = String(formData.get("pin") ?? "").replace(/\D/g, "");
  const next = String(formData.get("next") ?? "/");
  const key = await clientKey();

  const limit = rateLimit(`login:${key}`, 8, 10 * 60_000);
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} min.` };
  }
  if (!/^\d{6}$/.test(pin)) return { error: "Enter your 6-digit PIN." };

  const ok = await verifyPin(pin);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 450));
    return { error: "Wrong PIN." };
  }

  resetRateLimit(`login:${key}`);
  const token = await createSessionToken(env().OWNER_USER_ID);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
