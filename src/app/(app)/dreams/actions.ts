"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addImage,
  addMilestone,
  createDream,
  deleteDream,
  deleteImage,
  deleteMilestone,
  setEmotion,
  updateDream,
  updateMilestone,
} from "@/core/dreams";
import { addSavingsEntry, setSavingsTarget } from "@/core/savings";
import { AppError } from "@/core/errors";
import { createDreamSchema, updateDreamSchema } from "@/core/schemas";
import { toMinor } from "@/lib/utils";

export type FormState = { error?: string; ok?: boolean };

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

function money(fd: FormData, key: string): string | null {
  const raw = str(fd, key);
  return raw ? toMinor(raw) : null;
}

function revalidateDream(id?: string) {
  revalidatePath("/dreams");
  revalidatePath("/");
  if (id) revalidatePath(`/dreams/${id}`);
}

export async function createDreamAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const parsed = createDreamSchema.safeParse({
    title: str(fd, "title"),
    priority: str(fd, "priority") || "medium",
    target_date: str(fd, "target_date") || null,
    money_needed: money(fd, "money_needed"),
    importance_note: str(fd, "importance_note") || null,
    cover_image_url: str(fd, "cover_image_url") || null,
    glyph: str(fd, "glyph") || null,
    story: str(fd, "story") || null,
    emotional_reason: str(fd, "emotional_reason") || null,
    feeling: str(fd, "feeling") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields." };
  }

  try {
    const dream = await createDream(parsed.data);
    revalidateDream(dream.id);
    redirect(`/dreams?open=${dream.id}`);
  } catch (err) {
    if (err instanceof AppError) return { error: err.message };
    throw err;
  }
}

export async function updateDreamAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const id = str(fd, "id");
  if (!id) return { error: "Missing dream." };
  const parsed = updateDreamSchema.safeParse({
    title: str(fd, "title"),
    priority: str(fd, "priority") || undefined,
    target_date: str(fd, "target_date") || null,
    money_needed: money(fd, "money_needed"),
    importance_note: str(fd, "importance_note") || null,
    cover_image_url: str(fd, "cover_image_url") || null,
    glyph: str(fd, "glyph") || null,
    progress: str(fd, "progress") ? Number(str(fd, "progress")) : undefined,
    status: (str(fd, "status") || undefined) as "active" | "achieved" | "paused" | undefined,
    story: str(fd, "story") || null,
    emotional_reason: str(fd, "emotional_reason") || null,
    feeling: str(fd, "feeling") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields." };
  }
  try {
    await updateDream(id, parsed.data);
    revalidateDream(id);
    redirect(`/dreams?open=${id}`);
  } catch (err) {
    if (err instanceof AppError) return { error: err.message };
    throw err;
  }
}

export async function deleteDreamAction(fd: FormData): Promise<void> {
  const id = str(fd, "id");
  if (!id) return;
  await deleteDream(id);
  revalidateDream();
  redirect("/dreams");
}

export async function addMilestoneAction(fd: FormData): Promise<void> {
  const dreamId = str(fd, "dream_id");
  const title = str(fd, "title");
  if (!dreamId || !title) return;
  await addMilestone(dreamId, { title });
  revalidateDream(dreamId);
}

export async function toggleMilestoneAction(fd: FormData): Promise<void> {
  const id = str(fd, "id");
  const dreamId = str(fd, "dream_id");
  const done = str(fd, "done") === "true";
  if (!id) return;
  await updateMilestone(id, { done });
  revalidateDream(dreamId);
}

export async function removeMilestoneAction(fd: FormData): Promise<void> {
  const id = str(fd, "id");
  const dreamId = str(fd, "dream_id");
  if (!id) return;
  await deleteMilestone(id);
  revalidateDream(dreamId);
}

export async function addImageAction(fd: FormData): Promise<void> {
  const dreamId = str(fd, "dream_id");
  const url = str(fd, "url");
  if (!dreamId || !url) return;
  await addImage(dreamId, { url, caption: str(fd, "caption") || null });
  revalidateDream(dreamId);
}

export async function removeImageAction(fd: FormData): Promise<void> {
  const id = str(fd, "id");
  const dreamId = str(fd, "dream_id");
  if (!id) return;
  await deleteImage(id);
  revalidateDream(dreamId);
}

export async function setEmotionAction(fd: FormData): Promise<void> {
  const dreamId = str(fd, "dream_id");
  if (!dreamId) return;
  await setEmotion(dreamId, {
    story: str(fd, "story") || null,
    emotional_reason: str(fd, "emotional_reason") || null,
    feeling: str(fd, "feeling") || null,
  });
  revalidateDream(dreamId);
}

export async function addSavingAction(fd: FormData): Promise<void> {
  const dreamId = str(fd, "dream_id");
  const amount = str(fd, "amount");
  if (!dreamId || !amount) return;
  await addSavingsEntry(dreamId, { amount, note: str(fd, "note") || null });
  revalidateDream(dreamId);
}

export async function setSavingsTargetAction(fd: FormData): Promise<void> {
  const dreamId = str(fd, "dream_id");
  const target = str(fd, "target_amount");
  if (!dreamId) return;
  await setSavingsTarget(dreamId, {
    target_amount: target ? toMinor(target) : "0",
    currency: str(fd, "currency") || undefined,
  });
  revalidateDream(dreamId);
}
