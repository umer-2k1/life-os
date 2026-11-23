import { NextResponse } from "next/server";
import { errorBody } from "@/core/errors";
import { addImage, getDream } from "@/core/dreams";
import { uploadImage } from "@/core/storage";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await getDream(id);

    const form = await req.formData();
    const file = form.get("file");
    const urlField = String(form.get("url") ?? "").trim();
    const caption = String(form.get("caption") ?? "").trim() || null;

    if (urlField) {
      const image = await addImage(id, { url: urlField, caption });
      return NextResponse.json(image, { status: 201 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Send `file` or `url`." } },
        { status: 400 },
      );
    }

    const url = await uploadImage({
      buffer: Buffer.from(await file.arrayBuffer()),
      filename: file.name || "dream.jpg",
      mime: file.type || "image/jpeg",
    });
    const image = await addImage(id, { url, caption });
    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    const { status, body } = errorBody(err);
    return NextResponse.json(body, { status });
  }
}
