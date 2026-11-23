import { body, json } from "@/lib/api";
import { deleteMilestone, updateMilestone } from "@/core/dreams";
import { milestoneUpdateSchema } from "@/core/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  return json(async () => updateMilestone(id, await body(req, milestoneUpdateSchema)));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  return json(async () => deleteMilestone((await params).id));
}
