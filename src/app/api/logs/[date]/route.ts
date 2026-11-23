import { json } from "@/lib/api";
import { getDay } from "@/core/logs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  return json(async () => getDay(date));
}
