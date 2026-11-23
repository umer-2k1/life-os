import { body, json } from "@/lib/api";
import { setEmotion } from "@/core/dreams";
import { emotionSchema } from "@/core/schemas";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return json(async () => setEmotion(id, await body(req, emotionSchema)));
}
