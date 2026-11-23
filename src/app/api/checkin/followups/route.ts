import { json } from "@/lib/api";
import { getDay } from "@/core/logs";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? undefined;
  return json(async () => {
    const day = await getDay(date ?? undefined);
    return { questions: [], log: day.log, activities: day.activities };
  });
}
