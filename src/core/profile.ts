import { getDataSource } from "@/db/data-source";
import { Profile } from "@/db/entities";
import { env } from "@/lib/env";
import { AppError } from "./errors";
import { ensureBootstrap } from "./bootstrap";
import type { z } from "zod";
import type { profileUpdateSchema } from "./schemas";

export async function getProfile(): Promise<Profile> {
  await ensureBootstrap();
  const ds = await getDataSource();
  const profile = await ds.getRepository(Profile).findOneBy({ id: env().OWNER_USER_ID });
  if (!profile) throw new AppError("NOT_FOUND", "Profile not found.");
  return profile;
}

export async function updateProfile(
  input: z.infer<typeof profileUpdateSchema>,
): Promise<Profile> {
  const profile = await getProfile();
  const ds = await getDataSource();
  const patch: Partial<Profile> = {};
  if (input.display_name !== undefined) patch.display_name = input.display_name;
  if (input.north_star_amount !== undefined)
    patch.north_star_amount =
      input.north_star_amount === null ? null : String(input.north_star_amount);
  if (input.north_star_label !== undefined) patch.north_star_label = input.north_star_label;
  if (input.identity_line !== undefined) patch.identity_line = input.identity_line;
  if (input.motto !== undefined) patch.motto = input.motto;
  if (input.timezone !== undefined) patch.timezone = input.timezone;
  if (input.currency !== undefined) patch.currency = input.currency;
  await ds.getRepository(Profile).update({ id: profile.id }, patch);
  return getProfile();
}
