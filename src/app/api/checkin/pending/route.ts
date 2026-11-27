import { json } from "@/lib/api";
import { currentCheckinDate } from "@/core/checkin";
import { pendingCheckin } from "@/core/logs";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? undefined;
  return json(async () => pendingCheckin(date ?? (await currentCheckinDate())));
}
