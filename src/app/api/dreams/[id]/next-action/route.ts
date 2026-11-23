import { json } from "@/lib/api";
import { getDream, heuristicNextAction } from "@/core/dreams";
import { aiNextAction } from "@/core/ai";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return json(async () => {
    const dream = await getDream((await params).id);
    const ai = await aiNextAction(dream).catch(() => null);
    return { action: ai ?? heuristicNextAction(dream) };
  });
}
