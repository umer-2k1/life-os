import { body, json } from "@/lib/api";
import { activitiesBetween, createActivity } from "@/core/activities";
import { activityCreateSchema } from "@/core/schemas";
import { todayISO } from "@/lib/dates";
import { env } from "@/lib/env";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const today = todayISO(env().TIMEZONE);
  const from = url.searchParams.get("from") ?? today;
  const to = url.searchParams.get("to") ?? from;
  return json(async () => activitiesBetween(from, to));
}

export async function POST(req: Request) {
  return json(async () => createActivity(await body(req, activityCreateSchema)), {
    status: 201,
  });
}
