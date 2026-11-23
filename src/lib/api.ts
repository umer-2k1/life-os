import { NextResponse } from "next/server";
import type { z } from "zod";
import { AppError, errorBody } from "@/core/errors";

export async function json<T>(fn: () => Promise<T>, init?: ResponseInit): Promise<NextResponse> {
  try {
    return NextResponse.json(await fn(), init);
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}

export async function body<S extends z.ZodType<unknown>>(
  req: Request,
  schema: S,
): Promise<z.infer<S>> {
  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("BAD_REQUEST", parsed.error.issues[0]?.message ?? "Invalid body.");
  }
  return parsed.data as z.infer<S>;
}

export function idFrom(params: Promise<{ id: string }>): Promise<string> {
  return params.then((p) => p.id);
}
