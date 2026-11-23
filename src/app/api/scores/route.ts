import { json } from "@/lib/api";
import { scoreRange } from "@/core/scores";
import { todayISO } from "@/lib/dates";
import { env } from "@/lib/env";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const today = todayISO(env().TIMEZONE);
  return json(async () =>
    scoreRange(url.searchParams.get("from") ?? today, url.searchParams.get("to") ?? today),
  );
}
