import { getDataSource } from "@/db/data-source";
import {
  AiSettings,
  Dream,
  DreamEmotion,
  Milestone,
  NotificationPrefs,
  Profile,
  Savings,
  SavingsEntry,
} from "@/db/entities";
import { env } from "@/lib/env";
import { toMinor } from "@/lib/utils";
import { SEED_DREAMS } from "./seed-data";

let bootstrapped = false;

/**
 * Idempotent first-run setup: profile, prefs, AI settings, starter dreams.
 * Safe to call on every request; only writes once.
 */
export async function ensureBootstrap(): Promise<void> {
  const ds = await getDataSource();
  const ownerId = env().OWNER_USER_ID;

  const profiles = ds.getRepository(Profile);
  let profile = await profiles.findOneBy({ id: ownerId });
  if (!profile) {
    profile = profiles.create({
      id: ownerId,
      display_name: null,
      north_star_amount: null,
      north_star_label: `${env().CURRENCY} net worth`,
      identity_line: "I'm becoming someone who closes clients.",
      motto: "Make a shit ton of money. Nobody cares about it.",
      timezone: env().TIMEZONE,
      currency: env().CURRENCY,
    });
    await profiles.save(profile);
  }

  const prefsRepo = ds.getRepository(NotificationPrefs);
  const prefs = await prefsRepo.findOneBy({ user_id: ownerId });
  if (!prefs) {
    await prefsRepo.save(
      prefsRepo.create({
        user_id: ownerId,
        daily_ask_time: "00:00",
        reask_gap_hours: 6,
        quiet_start: "00:00",
        quiet_end: "06:00",
        channels: { telegram: true, web: true, email: false },
        push_enabled: true,
      }),
    );
  }

  const aiRepo = ds.getRepository(AiSettings);
  const ai = await aiRepo.findOneBy({ user_id: ownerId });
  if (!ai) {
    await aiRepo.save(
      aiRepo.create({
        user_id: ownerId,
        provider_order: ["groq", "openrouter", "grok", "deepseek"],
        selected_model: null,
        keys: {},
      }),
    );
  }

  if (bootstrapped) return;
  bootstrapped = true;

  // Demo dreams are opt-in only: `SEED_DREAMS=true pnpm db:seed`.
  // Real goals are created from the app / MCP; an empty list must stay empty.
  if (process.env.SEED_DREAMS !== "true") return;
  const dreams = ds.getRepository(Dream);
  const count = await dreams.count({ where: { user_id: ownerId } });
  if (count > 0) return;

  await seedDreams(ownerId);
}

export async function seedDreams(ownerId = env().OWNER_USER_ID): Promise<number> {
  const ds = await getDataSource();
  const dreams = ds.getRepository(Dream);
  const emotions = ds.getRepository(DreamEmotion);
  const milestones = ds.getRepository(Milestone);
  const savingsRepo = ds.getRepository(Savings);
  const entries = ds.getRepository(SavingsEntry);
  const currency = env().CURRENCY;

  let created = 0;
  for (const seed of SEED_DREAMS) {
    const dream = await dreams.save(
      dreams.create({
        user_id: ownerId,
        title: seed.title,
        glyph: seed.glyph,
        accent: seed.accent,
        priority: seed.priority,
        status: "active",
        target_date: seed.target_date,
        money_needed: seed.money_needed,
        progress: seed.progress,
        importance_note: seed.importance_note,
        last_touched_at: null,
      }),
    );
    created += 1;

    await emotions.save(
      emotions.create({
        dream_id: dream.id,
        story: seed.story,
        emotional_reason: seed.emotional_reason,
        feeling: seed.feeling,
        resurface_weight: seed.priority === "high" ? 2 : 1,
      }),
    );

    let sort = 0;
    for (const title of seed.milestones) {
      await milestones.save(
        milestones.create({ dream_id: dream.id, title, sort: sort++, done: false }),
      );
    }

    if (seed.money_needed) {
      const target = toMinor(Number(seed.money_needed) / 100);
      const saved = Math.round((Number(target) * seed.progress) / 100).toString();
      const savings = await savingsRepo.save(
        savingsRepo.create({
          dream_id: dream.id,
          target_amount: target,
          saved_amount: saved,
          currency,
        }),
      );
      if (Number(saved) > 0) {
        await entries.save(
          entries.create({ savings_id: savings.id, amount: saved, note: "Starting balance" }),
        );
      }
    }
  }
  return created;
}

/** Used by the seed script to force a re-seed. */
export async function resetAndSeed(): Promise<number> {
  const ds = await getDataSource();
  const ownerId = env().OWNER_USER_ID;
  await ds.getRepository(Dream).delete({ user_id: ownerId });
  return seedDreams(ownerId);
}
