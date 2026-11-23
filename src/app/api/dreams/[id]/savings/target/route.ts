import { body, json } from "@/lib/api";
import { setSavingsTarget } from "@/core/savings";
import { savingsTargetSchema } from "@/core/schemas";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return json(async () => setSavingsTarget(id, await body(req, savingsTargetSchema)));
}
