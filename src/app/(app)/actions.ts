"use server";

import { revalidatePath } from "next/cache";
import { completePriority, createActivity } from "@/core/activities";
import { logDay } from "@/core/logs";
import { addSavingsEntry } from "@/core/savings";
import { touchDream } from "@/core/dreams";

export async function completePriorityAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await completePriority(id);
  revalidatePath("/");
  revalidatePath("/activity");
}

export async function addPriorityAction(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim();
  const dreamId = String(formData.get("dream_id") ?? "") || null;
  if (!text) return;
  await createActivity({ text, dream_id: dreamId, column: "today" });
  revalidatePath("/");
  revalidatePath("/activity");
}

export async function logTodayAction(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  await logDay({ text, input_kind: "web" });
  revalidatePath("/");
  revalidatePath("/activity");
}

export async function quickSaveAction(formData: FormData): Promise<void> {
  const dreamId = String(formData.get("dream_id") ?? "");
  const amount = String(formData.get("amount") ?? "");
  if (!dreamId || !amount) return;
  await addSavingsEntry(dreamId, { amount, note: String(formData.get("note") ?? "") || null });
  await touchDream(dreamId);
  revalidatePath("/dreams");
  revalidatePath(`/dreams/${dreamId}`);
  revalidatePath("/");
}
