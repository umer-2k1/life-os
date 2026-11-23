import { body, json } from "@/lib/api";
import { getProfile, updateProfile } from "@/core/profile";
import { profileUpdateSchema } from "@/core/schemas";

export async function GET() {
  return json(async () => getProfile());
}

export async function PATCH(req: Request) {
  return json(async () => updateProfile(await body(req, profileUpdateSchema)));
}
