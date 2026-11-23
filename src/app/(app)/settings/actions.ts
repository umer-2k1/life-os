"use server";

import { revalidatePath } from "next/cache";
import { changePin } from "@/core/security";
import { updateProfile } from "@/core/profile";
import { profileUpdateSchema } from "@/core/schemas";
import { toMinor } from "@/lib/utils";
import { AppError } from "@/core/errors";

export type FormState = { ok?: boolean; error?: string };

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    display_name: String(formData.get("display_name") ?? "").trim() || null,
    north_star_amount: String(formData.get("north_star_amount") ?? "").trim()
      ? toMinor(String(formData.get("north_star_amount")))
      : null,
    north_star_label: String(formData.get("north_star_label") ?? "").trim() || null,
    identity_line: String(formData.get("identity_line") ?? "").trim() || null,
    motto: String(formData.get("motto") ?? "").trim() || undefined,
    timezone: String(formData.get("timezone") ?? "").trim() || undefined,
    currency: String(formData.get("currency") ?? "").trim().toUpperCase() || undefined,
  };

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields." };
  }

  try {
    await updateProfile(parsed.data);
  } catch (err) {
    return { error: err instanceof AppError ? err.message : "Could not save." };
  }
  revalidatePath("/settings");
  revalidatePath("/");
  return { ok: true };
}

export async function changePinAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const current = String(formData.get("current_pin") ?? "").replace(/\D/g, "");
  const next = String(formData.get("new_pin") ?? "").replace(/\D/g, "");
  const confirm = String(formData.get("confirm_pin") ?? "").replace(/\D/g, "");

  if (!/^\d{6}$/.test(current)) return { error: "Current PIN must be 6 digits." };
  if (!/^\d{6}$/.test(next)) return { error: "New PIN must be 6 digits." };
  if (next !== confirm) return { error: "New PIN and confirmation do not match." };

  try {
    await changePin(current, next);
  } catch (err) {
    return { error: err instanceof AppError ? err.message : "Could not change PIN." };
  }
  return { ok: true };
}
