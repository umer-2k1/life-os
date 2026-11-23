import { body, json } from "@/lib/api";
import { createDream, listDreams } from "@/core/dreams";
import { createDreamSchema } from "@/core/schemas";

export async function GET(req: Request) {
  return json(async () => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") as "active" | "achieved" | "paused" | null;
    const priority = url.searchParams.get("priority") as "low" | "medium" | "high" | null;
    return listDreams({
      status: status ?? undefined,
      priority: priority ?? undefined,
    });
  });
}

export async function POST(req: Request) {
  return json(async () => createDream(await body(req, createDreamSchema)), { status: 201 });
}
