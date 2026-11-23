"use server";

import { revalidatePath } from "next/cache";
import {
  createActivity,
  deleteActivity,
  updateActivity,
} from "@/core/activities";
import { logDay } from "@/core/logs";
import { kanbanSchema } from "@/core/schemas";
import type { KanbanColumn } from "@/db/entities";

export async function moveActivityAction(
  id: string,
  column: KanbanColumn,
): Promise<void> {
  const parsed = kanbanSchema.safeParse(column);
  if (!parsed.success) return;
  await updateActivity(id, { column: parsed.data });
  revalidatePath("/activity");
  revalidatePath("/");
}

export async function deleteActivityAction(id: string): Promise<void> {
  await deleteActivity(id);
  revalidatePath("/activity");
}

export async function logForDateAction(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim();
  const date = String(formData.get("date") ?? "") || undefined;
  if (!text) return;
  await logDay({ text, date, input_kind: "web", mode: "replace" });
  revalidatePath("/activity");
  revalidatePath("/");
}

export async function addActivityAction(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim();
  const date = String(formData.get("date") ?? "") || undefined;
  if (!text) return;
  await createActivity({ text, date, column: "today" });
  revalidatePath("/activity");
  revalidatePath("/");
}
