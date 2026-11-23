import { json } from "@/lib/api";
import { getSavings } from "@/core/savings";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return json(async () => getSavings((await params).id));
}
