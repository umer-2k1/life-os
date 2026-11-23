import { json } from "@/lib/api";
import { pendingCheckin } from "@/core/logs";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? undefined;
  return json(async () => pendingCheckin(date ?? undefined));
}
