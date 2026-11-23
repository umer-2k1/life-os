import { body, json } from "@/lib/api";
import { deleteActivity, updateActivity } from "@/core/activities";
import { activityUpdateSchema } from "@/core/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  return json(async () => updateActivity(id, await body(req, activityUpdateSchema)));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  return json(async () => deleteActivity((await params).id));
}
