import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";
import { env, hasCloudinary, hasSupabaseStorage } from "@/lib/env";
import { AppError } from "./errors";
import { slugify } from "@/lib/utils";

const MAX_BYTES = 8 * 1024 * 1024;

let cloudinaryReady = false;
function cloud() {
  if (!cloudinaryReady) {
    cloudinary.config({
      cloud_name: env().CLOUDINARY_CLOUD_NAME,
      api_key: env().CLOUDINARY_API_KEY,
      api_secret: env().CLOUDINARY_API_SECRET,
      secure: true,
    });
    cloudinaryReady = true;
  }
  return cloudinary;
}

export type UploadInput = { buffer: Buffer; filename: string; mime: string };

export function storageEnabled(): boolean {
  return hasCloudinary() || hasSupabaseStorage();
}

export function storageProvider(): "cloudinary" | "supabase" | null {
  if (hasCloudinary()) return "cloudinary";
  if (hasSupabaseStorage()) return "supabase";
  return null;
}

function validate(input: UploadInput) {
  if (!input.mime.startsWith("image/")) {
    throw new AppError("BAD_REQUEST", "Only image uploads are supported.");
  }
  if (input.buffer.byteLength > MAX_BYTES) {
    throw new AppError("BAD_REQUEST", "Image must be under 8 MB.");
  }
}

async function uploadCloudinary(input: UploadInput): Promise<string> {
  validate(input);
  const publicId = `life-os/${Date.now()}-${slugify(input.filename.replace(/\.[^.]+$/, "")) || "image"}`;
  return new Promise<string>((resolve, reject) => {
    const stream = cloud().uploader.upload_stream(
      {
        folder: "life-os",
        public_id: publicId.split("/").pop(),
        resource_type: "image",
        overwrite: false,
      },
      (err, result) => {
        if (err || !result?.secure_url) {
          console.error("[cloudinary]", err);
          reject(new AppError("INTERNAL", "Image upload failed."));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(input.buffer);
  });
}

async function uploadSupabase(input: UploadInput): Promise<string> {
  validate(input);
  const e = env();
  const supabase = createClient(e.NEXT_PUBLIC_SUPABASE_URL!, e.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const path = `dreams/${Date.now()}-${slugify(input.filename) || "image"}`;
  const { error } = await supabase.storage
    .from(e.SUPABASE_STORAGE_BUCKET)
    .upload(path, input.buffer, { contentType: input.mime, upsert: false });
  if (error) {
    console.error("[supabase storage]", error);
    throw new AppError("INTERNAL", "Image upload failed.");
  }
  const { data } = supabase.storage.from(e.SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImage(input: UploadInput): Promise<string> {
  if (hasCloudinary()) return uploadCloudinary(input);
  if (hasSupabaseStorage()) return uploadSupabase(input);
  throw new AppError("BAD_REQUEST", "No image storage configured. Paste an image URL instead.");
}
