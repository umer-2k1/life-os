import { getDataSource } from "@/db/data-source";
import { TelegramLink, type DailyLog } from "@/db/entities";
import { env } from "@/lib/env";
import { todayISO } from "@/lib/dates";
import { getStreak } from "../scores";
import { logDay, pendingCheckin } from "../logs";
import { listDreams } from "../dreams";
import { downloadFile, sendMessage, transcribeAudio } from "./api";

type Update = {
  message?: {
    message_id: number;
    chat: { id: number; username?: string; first_name?: string };
    text?: string;
    voice?: { file_id: string; duration: number };
    audio?: { file_id: string };
  };
};

const HELP = `Life OS — commands
/start · link this chat
/today · today's status + question
/dreams · list dreams
/score · latest score
/help · this list

Or just send a voice note / text: what did you do today?`;

async function linkChat(chatId: string, username?: string): Promise<void> {
  const ds = await getDataSource();
  const repo = ds.getRepository(TelegramLink);
  const existing = await repo.findOneBy({ chat_id: chatId });
  if (existing) return;
  const anyLink = await repo.findOne({ where: {} });
  if (anyLink) return; // single owner already linked
  await repo.save(
    repo.create({ user_id: env().OWNER_USER_ID, chat_id: chatId, username: username ?? null }),
  );
}

async function isLinked(chatId: string): Promise<boolean> {
  const ds = await getDataSource();
  const row = await ds.getRepository(TelegramLink).findOneBy({ chat_id: chatId });
  return Boolean(row);
}

export function recapText(log: DailyLog, streak: number): string {
  const lines: string[] = [];
  lines.push(`Day logged · Score ${log.score}/100 · 🔥 ${streak}-day`);
  for (const b of (log.summary_bullets ?? []).slice(0, 5)) lines.push(b);
  if (log.trajectory_note) lines.push(`— ${log.trajectory_note}`);
  if (log.next_action) lines.push(`Next: ${log.next_action}`);
  return lines.join("\n");
}

export async function handleUpdate(update: Update): Promise<void> {
  const message = update.message;
  if (!message) return;
  const chatId = String(message.chat.id);
  const username = message.chat.username;

  if (!(await isLinked(chatId))) {
    if (message.text?.startsWith("/start")) {
      await linkChat(chatId, username);
      await sendMessage(
        chatId,
        "Linked. This chat is now your Life OS.\n\nSay what you did today — voice or text. I'll score it and price the waste.\n\n" +
          HELP,
      );
      return;
    }
    await sendMessage(chatId, "Not linked. Send /start first.");
    return;
  }

  const text = message.text?.trim();
  if (text?.startsWith("/")) {
    await handleCommand(chatId, text);
    return;
  }

  try {
    let raw = text ?? "";
    let kind: "voice" | "telegram" = "telegram";
    if (message.voice || message.audio) {
      const fileId = message.voice?.file_id ?? message.audio!.file_id;
      const { buffer, filename } = await downloadFile(fileId);
      raw = await transcribeAudio(buffer, filename);
      kind = "voice";
    }
    if (!raw) {
      await sendMessage(chatId, "Nothing to log. Send voice or text.");
      return;
    }

    await sendMessage(chatId, "Scoring it…");
    const result = await logDay({ text: raw, input_kind: kind, mode: "append" });
    if (result.skipped) {
      await sendMessage(chatId, result.message ?? "That isn't an update. Try again.");
      return;
    }
    const streak = await getStreak();
    await sendMessage(chatId, recapText(result.log, streak.current));
  } catch (err) {
    console.error("[telegram]", err);
    const voiceFailed =
      message.voice || message.audio || (err instanceof Error && /transcription/i.test(err.message));
    await sendMessage(
      chatId,
      voiceFailed
        ? "I couldn't transcribe that voice note. Send the same update as text — voice is being fixed."
        : "Couldn't process that. Try again in a minute.",
    );
  }
}

async function handleCommand(chatId: string, text: string): Promise<void> {
  const command = text.split(/\s+/)[0].toLowerCase();
  if (command === "/start") {
    await sendMessage(chatId, "Already linked. Send voice or text to log today.");
    return;
  }
  if (command === "/help") {
    await sendMessage(chatId, HELP);
    return;
  }
  if (command === "/today") {
    const pending = await pendingCheckin();
    await sendMessage(
      chatId,
      pending.open
        ? `${pending.question}\n\nStreak: ${pending.streak} days.`
        : `Today is logged. Score ${pending.score ?? "—"}. Come back after midnight.`,
    );
    return;
  }
  if (command === "/score") {
    const pending = await pendingCheckin();
    await sendMessage(chatId, `Today: ${pending.open ? "not logged yet" : "logged"} · streak ${pending.streak}.`);
    return;
  }
  if (command === "/dreams") {
    const dreams = await listDreams({ status: "active" });
    const lines = dreams.map((d) => `${d.glyph ?? "◆"} ${d.title} · ${d.progress}%`);
    await sendMessage(chatId, lines.join("\n") || "No dreams yet.");
    return;
  }
  await sendMessage(chatId, HELP);
}

export async function sendDailyAsk(chatId: string, question: string): Promise<void> {
  await sendMessage(chatId, question);
}

export function currentDate(): string {
  return todayISO(env().TIMEZONE);
}
