import { body, json } from "@/lib/api";
import { addSavingsEntry } from "@/core/savings";
import { savingsEntrySchema } from "@/core/schemas";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return json(async () => addSavingsEntry(id, await body(req, savingsEntrySchema)), {
    status: 201,
  });
}
