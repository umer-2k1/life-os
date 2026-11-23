import { NextResponse } from "next/server";
import { errorBody } from "@/core/errors";
import { uploadImage } from "@/core/storage";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Send the image as `file`." } },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage({
      buffer,
      filename: file.name || "image",
      mime: file.type || "image/jpeg",
    });
    return NextResponse.json({ url });
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}
