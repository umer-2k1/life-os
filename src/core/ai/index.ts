import { z } from "zod";
import type { Activity, Dream } from "@/db/entities";
import type { ParsedUpdate } from "./heuristic";
import { getProfile } from "../profile";
import { aiAvailable, chatJson } from "./client";
import {
  nextActionPrompt,
  parsePrompt,
  scorePrompt,
  systemPreamble,
} from "./prompts";

const parsedSchema = z.object({
  activities: z
    .array(
      z.object({
        text: z.string().min(1),
        dream_title: z.string().nullable().optional().default(null),
        relevance: z.enum(["on_track", "neutral", "waste"]),
        score_delta: z.number().default(0),
        time_cost_days: z.number().min(0).max(60).default(0),
        suggestion: z.string().default(""),
      }),
    )
    .min(1)
    .max(12),
  followups: z.array(z.string()).default([]),
  needs_clarification: z.boolean().default(false),
});

const scoreSchema = z.object({
  score: z.number().min(0).max(100),
  summary_bullets: z.array(z.string()).min(1).max(5),
  trajectory_note: z.string().default(""),
  next_action: z.string().min(1),
});

export async function aiParseUpdate(
  raw: string,
  dreams: Dream[],
  date: string,
): Promise<ParsedUpdate | null> {
  if (!(await aiAvailable())) return null;
  const profile = await getProfile();
  const { data } = await chatJson({
    label: "parse",
    schema: parsedSchema,
    messages: [
      { role: "system", content: systemPreamble(profile, dreams) },
      { role: "user", content: parsePrompt(raw, date) },
    ],
  });
  return {
    activities: data.activities.map((a) => ({
      text: a.text.slice(0, 160),
      dream_title: a.dream_title ?? null,
      relevance: a.relevance,
      score_delta: Math.round(a.score_delta),
      time_cost_days: Math.round(a.time_cost_days * 10) / 10,
      suggestion: a.suggestion.slice(0, 180),
    })),
    followups: data.followups.slice(0, 2),
    needs_clarification: data.needs_clarification,
    engine: "ai",
  };
}

export async function aiScoreDay(
  activities: Activity[],
  dreams: Dream[],
  streak: number,
  recent: number[],
): Promise<{ score: number; bullets: string[]; trajectory: string; next: string } | null> {
  if (!(await aiAvailable())) return null;
  const profile = await getProfile();
  const { data } = await chatJson({
    label: "score",
    schema: scoreSchema,
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPreamble(profile, dreams) },
      { role: "user", content: scorePrompt(activities, streak, recent, dreams) },
    ],
  });
  return {
    score: Math.round(data.score),
    bullets: data.summary_bullets.slice(0, 5),
    trajectory: data.trajectory_note,
    next: data.next_action,
  };
}

const nextSchema = z.object({ action: z.string().min(1) });

export async function aiNextAction(dream: Dream): Promise<string | null> {
  if (!(await aiAvailable())) return null;
  const profile = await getProfile();
  const { data } = await chatJson({
    label: "next-action",
    schema: nextSchema,
    temperature: 0.4,
    messages: [
      { role: "system", content: systemPreamble(profile, [dream]) },
      { role: "user", content: nextActionPrompt(dream) },
    ],
  });
  return data.action;
}
