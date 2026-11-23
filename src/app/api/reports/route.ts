import { NextResponse } from "next/server";
import { errorBody } from "@/core/errors";
import { listReports } from "@/core/reports";

export async function GET() {
  try {
    return NextResponse.json(await listReports());
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}
