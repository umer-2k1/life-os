import { getDataSource } from "@/db/data-source";
import { Profile } from "@/db/entities";
import { env } from "@/lib/env";
import { hashPin, isSixDigitPin, verifyPinHash } from "@/lib/pin";
import { AppError } from "./errors";
import { ensureBootstrap } from "./bootstrap";

export const DEFAULT_PIN = "252525";

async function profile(): Promise<Profile | null> {
  const ds = await getDataSource();
  return ds.getRepository(Profile).findOneBy({ id: env().OWNER_USER_ID });
}

/**
 * First run (or legacy profile) gets the default PIN. It is changeable from
 * Settings after signing in.
 */
export async function ensurePin(): Promise<void> {
  await ensureBootstrap();
  const ds = await getDataSource();
  const row = await profile();
  if (!row) return;
  if (!row.pin_hash) {
    await ds.getRepository(Profile).update({ id: row.id }, { pin_hash: hashPin(DEFAULT_PIN) });
  }
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (!isSixDigitPin(pin)) return false;
  await ensurePin();
  const row = await profile();
  return verifyPinHash(pin, row?.pin_hash);
}

export async function changePin(current: string, next: string): Promise<void> {
  if (!isSixDigitPin(next)) {
    throw new AppError("BAD_REQUEST", "New PIN must be exactly 6 digits.");
  }
  if (next === current) {
    throw new AppError("BAD_REQUEST", "New PIN must be different.");
  }
  if (!(await verifyPin(current))) {
    throw new AppError("BAD_REQUEST", "Current PIN is wrong.");
  }
  const row = await profile();
  if (!row) throw new AppError("NOT_FOUND", "Profile not found.");
  const ds = await getDataSource();
  await ds.getRepository(Profile).update({ id: row.id }, { pin_hash: hashPin(next) });
}
