import { json } from "@/lib/api";
import { getFreeModels } from "@/core/ai/client";

export async function GET() {
  return json(async () => ({ models: await getFreeModels() }));
}
