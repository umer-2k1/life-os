import { getDataSource } from "@/db/data-source";
import { Dream, Savings, SavingsEntry } from "@/db/entities";
import { env } from "@/lib/env";
import { toMinor } from "@/lib/utils";
import { AppError } from "./errors";

export type SavingsDetail = Savings & { entries: SavingsEntry[] };

export async function getSavings(dreamId: string): Promise<SavingsDetail> {
  const ds = await getDataSource();
  const dream = await ds.getRepository(Dream).findOneBy({
    id: dreamId,
    user_id: env().OWNER_USER_ID,
  });
  if (!dream) throw new AppError("NOT_FOUND", "Dream not found.");

  const repo = ds.getRepository(Savings);
  let savings = await repo.findOneBy({ dream_id: dreamId });
  if (!savings) {
    savings = await repo.save(
      repo.create({
        dream_id: dreamId,
        target_amount: dream.money_needed ?? "0",
        saved_amount: "0",
        currency: env().CURRENCY,
      }),
    );
  }
  const entries = await ds.getRepository(SavingsEntry).find({
    where: { savings_id: savings.id },
    order: { created_at: "DESC" },
  });
  return Object.assign(savings, { entries });
}

export async function setSavingsTarget(
  dreamId: string,
  input: { target_amount?: string | number; currency?: string },
): Promise<Savings> {
  const ds = await getDataSource();
  const current = await getSavings(dreamId);
  const repo = ds.getRepository(Savings);
  if (input.target_amount !== undefined) {
    current.target_amount =
      typeof input.target_amount === "number"
        ? String(Math.round(input.target_amount))
        : toMinor(input.target_amount);
  }
  if (input.currency) current.currency = input.currency;
  return repo.save(current);
}

export async function addSavingsEntry(
  dreamId: string,
  input: { amount: string | number; note?: string | null },
): Promise<SavingsDetail> {
  const ds = await getDataSource();
  const savings = await getSavings(dreamId);
  const minor =
    typeof input.amount === "number" ? String(Math.round(input.amount)) : toMinor(input.amount);
  if (!minor || Number.isNaN(Number(minor))) {
    throw new AppError("BAD_REQUEST", "Amount must be a number.");
  }

  const entryRepo = ds.getRepository(SavingsEntry);
  await entryRepo.save(
    entryRepo.create({
      savings_id: savings.id,
      amount: minor,
      note: input.note ?? null,
    }),
  );

  const entries = await entryRepo.find({ where: { savings_id: savings.id } });
  const total = entries.reduce((sum, e) => sum + BigInt(String(e.amount)), BigInt(0));
  const repo = ds.getRepository(Savings);
  savings.saved_amount = total.toString();
  await repo.save(savings);
  return getSavings(dreamId);
}

export type NorthStarRollup = {
  target: number;
  saved: number;
  remaining: number;
  progress: number;
  currency: string;
  dreamCount: number;
};

export async function savingsRollup(): Promise<NorthStarRollup> {
  const ds = await getDataSource();
  const rows = await ds
    .getRepository(Savings)
    .createQueryBuilder("s")
    .innerJoin(Dream, "d", "d.id = s.dream_id")
    .where("d.user_id = :uid", { uid: env().OWNER_USER_ID })
    .andWhere("d.status = :status", { status: "active" })
    .getMany();

  let target = 0;
  let saved = 0;
  let currency = env().CURRENCY;
  for (const row of rows) {
    target += Number(row.target_amount ?? 0);
    saved += Number(row.saved_amount ?? 0);
    currency = row.currency || currency;
  }
  return {
    target,
    saved,
    remaining: Math.max(0, target - saved),
    progress: target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0,
    currency,
    dreamCount: rows.length,
  };
}
