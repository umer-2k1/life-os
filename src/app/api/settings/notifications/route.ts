import { body, json } from "@/lib/api";
import { getNotificationPrefs, updateNotificationPrefs } from "@/core/settings";
import { notificationUpdateSchema } from "@/core/schemas";

export async function GET() {
  return json(async () => getNotificationPrefs());
}

export async function PUT(req: Request) {
  return json(async () => updateNotificationPrefs(await body(req, notificationUpdateSchema)));
}
