import { json } from "@/lib/api";
import { getStreak, getTotalPoints } from "@/core/scores";
import { levelFor } from "@/core/scoring";

export async function GET() {
  return json(async () => {
    const streak = await getStreak();
    const points = await getTotalPoints();
    return { ...streak, points, level: levelFor(points) };
  });
}
