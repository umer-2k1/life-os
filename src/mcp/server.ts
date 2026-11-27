import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AppError } from "@/core/errors";
import {
  addMilestone,
  createDream,
  deleteDream,
  getDream,
  heuristicNextAction,
  listDreams,
  setEmotion,
  updateDream,
  updateMilestone,
} from "@/core/dreams";
import { activitiesBetween, createActivity, updateActivity } from "@/core/activities";
import { logDay, getDay, pendingCheckin, saveReflection } from "@/core/logs";
import { currentCheckinDate, resolveCheckinDate } from "@/core/checkin";
import { scoreRange, getStreak, getTotalPoints } from "@/core/scores";
import { addSavingsEntry, getSavings, setSavingsTarget } from "@/core/savings";
import { getProfile, updateProfile } from "@/core/profile";
import { generateReport, getReport, listReports } from "@/core/reports";
import { getDashboard } from "@/core/dashboard";
import { aiNextAction } from "@/core/ai";
import { todayISO } from "@/lib/dates";
import { env } from "@/lib/env";

const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

const err = (e: unknown) => {
  const message = e instanceof AppError ? e.message : e instanceof Error ? e.message : "Error";
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
    isError: true,
  };
};

export function createMcpServer(): McpServer {
  const server = new McpServer(
    { name: "life-os", version: "1.0.0" },
    {
      instructions:
        "Private single-user Life OS. Bullets only. Log the day with answer_checkin, then read the recap. Every write goes through the same core as the website and Telegram bot.",
    },
  );

  // ── Dreams ────────────────────────────────────────────────────────────────
  server.tool(
    "list_dreams",
    "List dreams with priority, progress, savings and days since touched.",
    {
      status: z.enum(["active", "achieved", "paused"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
    },
    async ({ status, priority }) => {
      try {
        const dreams = await listDreams({ status, priority });
        return text(
          dreams.map((d) => ({
            id: d.id,
            title: d.title,
            priority: d.priority,
            status: d.status,
            progress: d.progress,
            target_date: d.target_date,
            glyph: d.glyph,
            saved: d.savings?.saved_amount ?? "0",
            target: d.savings?.target_amount ?? null,
            last_touched_at: d.last_touched_at,
          })),
        );
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    "get_dream",
    "Full dream detail: emotional anchor, milestones, gallery, savings.",
    { dream_id: z.string() },
    async ({ dream_id }) => {
      try {
        return text(await getDream(dream_id));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    "create_dream",
    "Create a dream. Minimum: title.",
    {
      title: z.string(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      target_date: z.string().optional(),
      money_needed: z.string().optional(),
      story: z.string().optional(),
      emotional_reason: z.string().optional(),
      feeling: z.string().optional(),
      glyph: z.string().optional(),
    },
    async (input) => {
      try {
        return text(
          await createDream({
            ...input,
            title: input.title,
            priority: input.priority ?? "medium",
            status: "active",
          }),
        );
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    "update_dream",
    "Update any dream field.",
    {
      dream_id: z.string(),
      title: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      status: z.enum(["active", "achieved", "paused"]).optional(),
      progress: z.number().min(0).max(100).optional(),
      target_date: z.string().nullable().optional(),
      money_needed: z.string().nullable().optional(),
      importance_note: z.string().nullable().optional(),
    },
    async ({ dream_id, ...rest }) => {
      try {
        return text(await updateDream(dream_id, rest));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool("delete_dream", "Delete a dream and its children.", { dream_id: z.string() }, async ({ dream_id }) => {
    try {
      return text(await deleteDream(dream_id));
    } catch (e) {
      return err(e);
    }
  });

  server.tool("add_milestone", "Add a milestone to a dream.", { dream_id: z.string(), title: z.string() }, async ({ dream_id, title }) => {
    try {
      return text(await addMilestone(dream_id, { title }));
    } catch (e) {
      return err(e);
    }
  });

  server.tool(
    "complete_milestone",
    "Mark a milestone done or undone.",
    { milestone_id: z.string(), done: z.boolean().default(true) },
    async ({ milestone_id, done }) => {
      try {
        return text(await updateMilestone(milestone_id, { done }));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    "set_emotional_anchor",
    "Set the why: story, raw emotional reason, feeling.",
    {
      dream_id: z.string(),
      story: z.string().optional(),
      emotional_reason: z.string().optional(),
      feeling: z.string().optional(),
    },
    async ({ dream_id, ...rest }) => {
      try {
        return text(await setEmotion(dream_id, rest));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool("next_action", "The single next action for a dream.", { dream_id: z.string() }, async ({ dream_id }) => {
    try {
      const dream = await getDream(dream_id);
      const ai = await aiNextAction(dream).catch(() => null);
      return text({ action: ai ?? heuristicNextAction(dream) });
    } catch (e) {
      return err(e);
    }
  });

  // ── Check-in ──────────────────────────────────────────────────────────────
  server.tool("get_pending_checkin", "Is the open check-in still unanswered? Returns the question and its date.", {}, async () => {
    try {
      return text(await pendingCheckin(await currentCheckinDate()));
    } catch (e) {
      return err(e);
    }
  });

  server.tool(
    "answer_checkin",
    "Submit the daily update (text). Closes the check-in on every channel.",
    { text: z.string(), date: z.string().optional() },
    async ({ text: body, date }) => {
      try {
        const target = await resolveCheckinDate(date);
        const result = await logDay({ text: body, date: target, input_kind: "mcp" });
        return text({
          score: result.log.score,
          bullets: result.log.summary_bullets,
          trajectory: result.log.trajectory_note,
          next: result.log.next_action,
          activities: result.activities.map((a) => ({
            text: a.text,
            relevance: a.relevance,
            days: a.time_cost_days,
          })),
        });
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool("log_day", "Alias of answer_checkin.", { text: z.string(), date: z.string().optional() }, async ({ text: body, date }) => {
    try {
      const result = await logDay({ text: body, date, input_kind: "mcp" });
      return text({
        score: result.log.score,
        bullets: result.log.summary_bullets,
        next: result.log.next_action,
      });
    } catch (e) {
      return err(e);
    }
  });

  server.tool("get_day", "Recap, score and activities for a date.", { date: z.string().optional() }, async ({ date }) => {
    try {
      return text(await getDay(date));
    } catch (e) {
      return err(e);
    }
  });

  server.tool(
    "add_reflection",
    "Evening reflection: accomplished, wasted, improve.",
    {
      date: z.string().optional(),
      accomplished: z.string().optional(),
      wasted: z.string().optional(),
      improve: z.string().optional(),
    },
    async (input) => {
      try {
        return text(await saveReflection(input));
      } catch (e) {
        return err(e);
      }
    },
  );

  // ── Activities ────────────────────────────────────────────────────────────
  server.tool(
    "add_activity",
    "Add an activity card to the board.",
    { text: z.string(), date: z.string().optional(), dream_id: z.string().optional() },
    async ({ text: body, date, dream_id }) => {
      try {
        return text(await createActivity({ text: body, date, dream_id, column: "today" }));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    "move_activity",
    "Move an activity between kanban columns.",
    { activity_id: z.string(), column: z.enum(["today", "doing", "done", "wasted"]) },
    async ({ activity_id, column }) => {
      try {
        return text(await updateActivity(activity_id, { column }));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    "get_activities",
    "Activities in a date range.",
    { from: z.string().optional(), to: z.string().optional() },
    async ({ from, to }) => {
      try {
        const day = todayISO(env().TIMEZONE);
        return text(await activitiesBetween(from ?? day, to ?? day));
      } catch (e) {
        return err(e);
      }
    },
  );

  // ── Scores ────────────────────────────────────────────────────────────────
  server.tool("get_score", "Today's check-in, score and pending state.", {}, async () => {
    try {
      return text(await pendingCheckin());
    } catch (e) {
      return err(e);
    }
  });

  server.tool(
    "get_heatmap",
    "Daily scores for a range.",
    { from: z.string().optional(), to: z.string().optional() },
    async ({ from, to }) => {
      try {
        const today = todayISO(env().TIMEZONE);
        return text(await scoreRange(from ?? today, to ?? today));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool("get_streak", "Current and best streak plus total points.", {}, async () => {
    try {
      return text({ ...(await getStreak()), points: await getTotalPoints() });
    } catch (e) {
      return err(e);
    }
  });

  // ── Savings ───────────────────────────────────────────────────────────────
  server.tool("get_savings", "Savings tracker for a dream.", { dream_id: z.string() }, async ({ dream_id }) => {
    try {
      return text(await getSavings(dream_id));
    } catch (e) {
      return err(e);
    }
  });

  server.tool(
    "add_saving",
    "Add money to a dream's savings.",
    { dream_id: z.string(), amount: z.string(), note: z.string().optional() },
    async ({ dream_id, amount, note }) => {
      try {
        return text(await addSavingsEntry(dream_id, { amount, note }));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    "set_savings_target",
    "Set a dream's savings target/currency.",
    { dream_id: z.string(), target_amount: z.string().optional(), currency: z.string().optional() },
    async ({ dream_id, target_amount, currency }) => {
      try {
        return text(await setSavingsTarget(dream_id, { target_amount, currency }));
      } catch (e) {
        return err(e);
      }
    },
  );

  // ── Reports ───────────────────────────────────────────────────────────────
  server.tool(
    "generate_report",
    "Generate a weekly, monthly or custom report.",
    {
      kind: z.enum(["weekly", "monthly", "custom"]).default("weekly"),
      range_start: z.string().optional(),
      range_end: z.string().optional(),
      email: z.boolean().optional(),
    },
    async (input) => {
      try {
        return text(
          await generateReport({
            kind: input.kind,
            start: input.range_start,
            end: input.range_end,
            email: input.email,
          }),
        );
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool("list_reports", "List saved reports.", {}, async () => {
    try {
      return text(await listReports());
    } catch (e) {
      return err(e);
    }
  });

  server.tool("get_report", "Read one report.", { report_id: z.string() }, async ({ report_id }) => {
    try {
      return text(await getReport(report_id));
    } catch (e) {
      return err(e);
    }
  });

  // ── Profile / dashboard ──────────────────────────────────────────────────
  server.tool("get_profile", "Profile, North Star and identity.", {}, async () => {
    try {
      return text(await getProfile());
    } catch (e) {
      return err(e);
    }
  });

  server.tool(
    "update_profile",
    "Update North Star, identity, motto or timezone.",
    {
      north_star_amount: z.string().optional(),
      north_star_label: z.string().optional(),
      identity_line: z.string().optional(),
      motto: z.string().optional(),
      timezone: z.string().optional(),
    },
    async (input) => {
      try {
        return text(await updateProfile(input));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool("dashboard", "The trophy-room payload.", {}, async () => {
    try {
      return text(await getDashboard());
    } catch (e) {
      return err(e);
    }
  });

  return server;
}
