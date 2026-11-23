import { z } from "zod";

export const prioritySchema = z.enum(["low", "medium", "high"]);
export const dreamStatusSchema = z.enum(["active", "achieved", "paused"]);
export const relevanceSchema = z.enum(["on_track", "neutral", "waste"]);
export const kanbanSchema = z.enum(["today", "doing", "done", "wasted"]);
export const inputKindSchema = z.enum(["voice", "text", "mcp", "web", "telegram"]);

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const createDreamSchema = z.object({
  title: z.string().trim().min(1).max(120),
  priority: prioritySchema.default("medium"),
  status: dreamStatusSchema.default("active"),
  target_date: isoDate.optional().nullable(),
  money_needed: z.union([z.string(), z.number()]).optional().nullable(),
  importance_note: z.string().max(4000).optional().nullable(),
  cover_image_url: z.string().url().optional().nullable().or(z.literal("").transform(() => null)),
  glyph: z.string().max(8).optional().nullable(),
  accent: z.string().max(80).optional().nullable(),
  progress: z.number().int().min(0).max(100).optional(),
  story: z.string().max(8000).optional().nullable(),
  emotional_reason: z.string().max(8000).optional().nullable(),
  feeling: z.string().max(200).optional().nullable(),
});

export const updateDreamSchema = createDreamSchema.partial();

export const emotionSchema = z.object({
  story: z.string().max(8000).optional().nullable(),
  emotional_reason: z.string().max(8000).optional().nullable(),
  feeling: z.string().max(200).optional().nullable(),
  voice_note_url: z.string().max(2000).optional().nullable(),
  resurface_weight: z.number().int().min(0).max(10).optional(),
});

export const milestoneCreateSchema = z.object({
  title: z.string().trim().min(1).max(140),
  sort: z.number().int().optional(),
});

export const milestoneUpdateSchema = z.object({
  title: z.string().trim().min(1).max(140).optional(),
  done: z.boolean().optional(),
  sort: z.number().int().optional(),
});

export const imageCreateSchema = z.object({
  url: z.string().min(1).max(2000),
  caption: z.string().max(300).optional().nullable(),
  sort: z.number().int().optional(),
});

export const savingsEntrySchema = z.object({
  amount: z.union([z.string(), z.number()]),
  note: z.string().max(500).optional().nullable(),
});

export const savingsTargetSchema = z.object({
  target_amount: z.union([z.string(), z.number()]).optional(),
  currency: z.string().min(1).max(8).optional(),
});

export const logDaySchema = z.object({
  text: z.string().trim().min(1).max(20_000),
  date: isoDate.optional(),
  input_kind: inputKindSchema.default("web"),
});

export const reflectionSchema = z.object({
  date: isoDate.optional(),
  accomplished: z.string().max(4000).optional().nullable(),
  wasted: z.string().max(4000).optional().nullable(),
  improve: z.string().max(4000).optional().nullable(),
});

export const activityCreateSchema = z.object({
  date: isoDate.optional(),
  text: z.string().trim().min(1).max(500),
  dream_id: z.string().uuid().optional().nullable(),
  relevance: relevanceSchema.optional(),
  column: kanbanSchema.optional(),
});

export const activityUpdateSchema = z.object({
  column: kanbanSchema.optional(),
  dream_id: z.string().uuid().nullable().optional(),
  text: z.string().trim().min(1).max(500).optional(),
  priority: z.boolean().optional(),
});

export const profileUpdateSchema = z.object({
  display_name: z.string().max(120).optional().nullable(),
  north_star_amount: z.union([z.string(), z.number()]).optional().nullable(),
  north_star_label: z.string().max(120).optional().nullable(),
  identity_line: z.string().max(240).optional().nullable(),
  motto: z.string().max(240).optional(),
  timezone: z.string().max(80).optional(),
  currency: z.string().max(8).optional(),
});

export const aiSettingsUpdateSchema = z.object({
  provider_order: z.array(z.string()).optional(),
  selected_model: z.string().max(200).optional().nullable(),
  keys: z.record(z.string(), z.string()).optional(),
});

export const notificationUpdateSchema = z.object({
  daily_ask_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  reask_gap_hours: z.number().int().min(1).max(24).optional(),
  quiet_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  quiet_end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  channels: z.record(z.string(), z.boolean()).optional(),
  push_enabled: z.boolean().optional(),
});

export const reportRequestSchema = z.object({
  kind: z.enum(["weekly", "monthly", "custom"]).default("weekly"),
  range_start: isoDate.optional(),
  range_end: isoDate.optional(),
  email: z.boolean().optional(),
});
