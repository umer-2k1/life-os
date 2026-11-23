import { NextResponse } from "next/server";
import { errorBody } from "@/core/errors";
import { getReport, reportPdf } from "@/core/reports";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const report = await getReport(id);
    const pdf = await reportPdf(report);
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="life-os-${report.kind}-${report.range_end}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}
