import { body, json } from "@/lib/api";
import { logDay } from "@/core/logs";
import { logDaySchema } from "@/core/schemas";

export async function POST(req: Request) {
  const input = await body(req, logDaySchema);
  return json(
    async () => {
      const result = await logDay(input);
      return {
        log: result.log,
        activities: result.activities,
        engine: result.engine,
      };
    },
    { status: 201 },
  );
}
