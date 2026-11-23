import { body, json } from "@/lib/api";
import { getAiSettings, maskedKeys, updateAiSettings } from "@/core/settings";
import { aiSettingsUpdateSchema } from "@/core/schemas";
import { getFreeModels } from "@/core/ai/client";

export async function GET() {
  return json(async () => {
    const [settings, keys, models] = await Promise.all([
      getAiSettings(),
      maskedKeys(),
      getFreeModels().catch(() => []),
    ]);
    return {
      provider_order: settings?.provider_order ?? [],
      selected_model: settings?.selected_model ?? null,
      keys,
      models: models.slice(0, 40),
    };
  });
}

export async function PUT(req: Request) {
  const input = await body(req, aiSettingsUpdateSchema);
  return json(async () => {
    const row = await updateAiSettings(input);
    return {
      provider_order: row.provider_order,
      selected_model: row.selected_model,
      keys: await maskedKeys(),
    };
  });
}
