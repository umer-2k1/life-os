import { getDataSource } from "@/db/data-source";
import {
  Dream,
  DreamEmotion,
  DreamImage,
  Milestone,
  Savings,
} from "@/db/entities";
import { env } from "@/lib/env";
import { formatMoney } from "@/lib/utils";
import type { z } from "zod";
import { AppError } from "./errors";
import type { createDreamSchema, emotionSchema, updateDreamSchema } from "./schemas";

export type CreateDreamInput = z.infer<typeof createDreamSchema>;
export type UpdateDreamInput = z.infer<typeof updateDreamSchema>;
export type EmotionInput = z.infer<typeof emotionSchema>;

const RELATIONS = {
  emotion: true,
  milestones: true,
  savings: true,
  images: true,
} as const;

export async function listDreams(
  opts: { status?: "active" | "achieved" | "paused"; priority?: "low" | "medium" | "high" } = {},
): Promise<Dream[]> {
  const ds = await getDataSource();
  const where: Record<string, unknown> = { user_id: env().OWNER_USER_ID };
  if (opts.status) where.status = opts.status;
  if (opts.priority) where.priority = opts.priority;
  return ds.getRepository(Dream).find({
    where,
    relations: RELATIONS,
    order: { created_at: "ASC" },
  });
}

export async function getDream(id: string): Promise<Dream> {
  const ds = await getDataSource();
  const dream = await ds.getRepository(Dream).findOne({
    where: { id, user_id: env().OWNER_USER_ID },
    relations: RELATIONS,
  });
  if (!dream) throw new AppError("NOT_FOUND", "Dream not found.");
  return dream;
}

export async function createDream(input: CreateDreamInput): Promise<Dream> {
  const ds = await getDataSource();
  const repo = ds.getRepository(Dream);
  const row = repo.create({
    title: input.title,
    priority: input.priority,
    status: input.status,
    target_date: input.target_date ?? null,
    money_needed: input.money_needed != null ? String(input.money_needed) : null,
    importance_note: input.importance_note ?? null,
    cover_image_url: input.cover_image_url ?? null,
    glyph: input.glyph ?? null,
    accent: input.accent ?? null,
    progress: input.progress ?? 0,
    user_id: env().OWNER_USER_ID,
    last_touched_at: null,
  });
  const dream = await repo.save(row);

  if (input.story || input.emotional_reason || input.feeling) {
    await setEmotion(dream.id, {
      story: input.story,
      emotional_reason: input.emotional_reason,
      feeling: input.feeling,
    });
  }

  if (input.money_needed) {
    const savingsRepo = ds.getRepository(Savings);
    const existing = await savingsRepo.findOne({ where: { dream_id: dream.id } });
    if (!existing) {
      await savingsRepo.save(
        savingsRepo.create({
          dream_id: dream.id,
          target_amount: String(input.money_needed),
          saved_amount: "0",
          currency: env().CURRENCY,
        }),
      );
    }
  }

  return getDream(dream.id);
}

export async function updateDream(id: string, input: UpdateDreamInput): Promise<Dream> {
  const ds = await getDataSource();
  const repo = ds.getRepository(Dream);
  const dream = await repo.findOneBy({ id, user_id: env().OWNER_USER_ID });
  if (!dream) throw new AppError("NOT_FOUND", "Dream not found.");

  const patch: Partial<Dream> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.status !== undefined) patch.status = input.status;
  if (input.target_date !== undefined) patch.target_date = input.target_date;
  if (input.money_needed !== undefined)
    patch.money_needed = input.money_needed != null ? String(input.money_needed) : null;
  if (input.importance_note !== undefined) patch.importance_note = input.importance_note;
  if (input.cover_image_url !== undefined) patch.cover_image_url = input.cover_image_url;
  if (input.glyph !== undefined) patch.glyph = input.glyph;
  if (input.accent !== undefined) patch.accent = input.accent;
  if (input.progress !== undefined) patch.progress = input.progress;
  if (input.status === "achieved") patch.progress = 100;

  await repo.update({ id: dream.id }, patch);

  if (
    input.story !== undefined ||
    input.emotional_reason !== undefined ||
    input.feeling !== undefined
  ) {
    await setEmotion(dream.id, {
      story: input.story,
      emotional_reason: input.emotional_reason,
      feeling: input.feeling,
    });
  }

  return getDream(dream.id);
}

export async function deleteDream(id: string): Promise<{ ok: true }> {
  const ds = await getDataSource();
  const repo = ds.getRepository(Dream);
  const dream = await repo.findOneBy({ id, user_id: env().OWNER_USER_ID });
  if (!dream) throw new AppError("NOT_FOUND", "Dream not found.");
  await repo.remove(dream);
  return { ok: true };
}

export async function touchDream(id: string): Promise<void> {
  const ds = await getDataSource();
  await ds.getRepository(Dream).update(
    { id, user_id: env().OWNER_USER_ID },
    { last_touched_at: new Date() },
  );
}

export async function setEmotion(dreamId: string, input: EmotionInput): Promise<DreamEmotion> {
  const ds = await getDataSource();
  await getDream(dreamId);
  const repo = ds.getRepository(DreamEmotion);
  let emotion = await repo.findOneBy({ dream_id: dreamId });
  if (!emotion) {
    emotion = repo.create({ dream_id: dreamId, resurface_weight: 1 });
  }
  if (input.story !== undefined) emotion.story = input.story;
  if (input.emotional_reason !== undefined) emotion.emotional_reason = input.emotional_reason;
  if (input.feeling !== undefined) emotion.feeling = input.feeling;
  if (input.voice_note_url !== undefined) emotion.voice_note_url = input.voice_note_url;
  if (input.resurface_weight !== undefined) emotion.resurface_weight = input.resurface_weight;
  return repo.save(emotion);
}

export async function addMilestone(
  dreamId: string,
  input: { title: string; sort?: number },
): Promise<Milestone> {
  const ds = await getDataSource();
  await getDream(dreamId);
  const repo = ds.getRepository(Milestone);
  const count = await repo.count({ where: { dream_id: dreamId } });
  return repo.save(
    repo.create({
      dream_id: dreamId,
      title: input.title,
      sort: input.sort ?? count,
      done: false,
    }),
  );
}

export async function updateMilestone(
  id: string,
  input: { title?: string; done?: boolean; sort?: number },
): Promise<Milestone> {
  const ds = await getDataSource();
  const repo = ds.getRepository(Milestone);
  const milestone = await repo.findOneBy({ id });
  if (!milestone) throw new AppError("NOT_FOUND", "Milestone not found.");
  if (input.title !== undefined) milestone.title = input.title;
  if (input.sort !== undefined) milestone.sort = input.sort;
  if (input.done !== undefined) {
    milestone.done = input.done;
    milestone.done_at = input.done ? new Date().toISOString().slice(0, 10) : null;
  }
  const saved = await repo.save(milestone);
  if (input.done) await touchDream(milestone.dream_id);
  return saved;
}

export async function deleteMilestone(id: string): Promise<{ ok: true }> {
  const ds = await getDataSource();
  const repo = ds.getRepository(Milestone);
  const milestone = await repo.findOneBy({ id });
  if (!milestone) throw new AppError("NOT_FOUND", "Milestone not found.");
  await repo.remove(milestone);
  return { ok: true };
}

export async function addImage(
  dreamId: string,
  input: { url: string; caption?: string | null; sort?: number },
): Promise<DreamImage> {
  const ds = await getDataSource();
  await getDream(dreamId);
  const repo = ds.getRepository(DreamImage);
  const count = await repo.count({ where: { dream_id: dreamId } });
  return repo.save(
    repo.create({
      dream_id: dreamId,
      url: input.url,
      caption: input.caption ?? null,
      sort: input.sort ?? count,
    }),
  );
}

export async function deleteImage(id: string): Promise<{ ok: true }> {
  const ds = await getDataSource();
  const repo = ds.getRepository(DreamImage);
  const image = await repo.findOneBy({ id });
  if (!image) throw new AppError("NOT_FOUND", "Image not found.");
  await repo.remove(image);
  return { ok: true };
}

/** Heuristic next action; the AI version overrides it when a key exists. */
export function heuristicNextAction(dream: Dream): string {
  const open = (dream.milestones ?? []).filter((m) => !m.done).sort((a, b) => a.sort - b.sort);
  if (open.length) return open[0].title;
  const remaining =
    Number(dream.savings?.target_amount ?? 0) - Number(dream.savings?.saved_amount ?? 0);
  if (remaining > 0) {
    return `Put aside ${formatMoney(remaining, dream.savings?.currency ?? "PKR", { compact: true })} toward ${dream.title}`;
  }
  if (dream.progress < 100) return `Spend 30 focused minutes moving ${dream.title} forward`;
  return `You're done. Set the next dream.`;
}

export async function pickResurfaceDream(dreams: Dream[]): Promise<Dream | null> {
  const candidates = dreams.filter((d) => d.status === "active" && d.emotion?.emotional_reason);
  if (!candidates.length) return dreams.find((d) => d.status === "active") ?? null;
  const weighted: Dream[] = [];
  for (const d of candidates) {
    const w = Math.max(1, d.emotion?.resurface_weight ?? 1);
    for (let i = 0; i < w; i++) weighted.push(d);
  }
  const day = new Date().getDate() + new Date().getMonth() * 31;
  return weighted[day % weighted.length] ?? candidates[0];
}
