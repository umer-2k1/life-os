import { body, json } from "@/lib/api";
import { resolveCheckinDate } from "@/core/checkin";
import { logDay } from "@/core/logs";
import { logDaySchema } from "@/core/schemas";

export async function POST(req: Request) {
  const input = await body(req, logDaySchema);
  return json(
    async () => {
      const date = await resolveCheckinDate(input.date);
      const result = await logDay({ ...input, date });
      return {
        log: result.log,
        activities: result.activities,
        engine: result.engine,
      };
    },
    { status: 201 },
  );
}
