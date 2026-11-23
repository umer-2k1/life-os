import { NextResponse } from "next/server";
import { errorBody } from "@/core/errors";
import { generateReport } from "@/core/reports";
import { reportRequestSchema } from "@/core/schemas";

export async function POST(req: Request) {
  try {
    const parsed = reportRequestSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: parsed.error.issues[0]?.message ?? "Bad body." } },
        { status: 400 },
      );
    }
    const report = await generateReport({
      kind: parsed.data.kind,
      start: parsed.data.range_start,
      end: parsed.data.range_end,
      email: parsed.data.email,
    });
    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}
