import { body, json } from "@/lib/api";
import { deleteDream, getDream, updateDream } from "@/core/dreams";
import { updateDreamSchema } from "@/core/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  return json(async () => getDream((await params).id));
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  return json(async () => updateDream(id, await body(req, updateDreamSchema)));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  return json(async () => deleteDream((await params).id));
}
