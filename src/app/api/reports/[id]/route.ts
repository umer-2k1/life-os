import { NextResponse } from "next/server";
import { errorBody } from "@/core/errors";
import { getReport } from "@/core/reports";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(await getReport(id));
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}
