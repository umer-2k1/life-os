import { body, json } from "@/lib/api";
import { addMilestone } from "@/core/dreams";
import { milestoneCreateSchema } from "@/core/schemas";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return json(async () => addMilestone(id, await body(req, milestoneCreateSchema)), {
    status: 201,
  });
}
