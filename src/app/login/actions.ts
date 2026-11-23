"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { env } from "@/lib/env";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!env().APP_PASSWORD) {
    return { error: "APP_PASSWORD is not set in .env." };
  }
  if (!password) return { error: "Enter your password." };

  const ok = await verifyPassword(password);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Wrong password." };
  }

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
