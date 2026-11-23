import { NextResponse } from "next/server";
import { getDataSource } from "@/db/data-source";

export async function GET() {
  const services = {
    database: false,
    ai: Boolean(
      process.env.OPENROUTER_API_KEY ||
        process.env.GROQ_API_KEY ||
        process.env.XAI_API_KEY ||
        process.env.DEEPSEEK_API_KEY,
    ),
    cloudinary: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET,
    ),
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    resend: Boolean(process.env.RESEND_API_KEY),
    mcp: Boolean(process.env.MCP_AUTH_TOKEN),
  };

  try {
    const ds = await getDataSource();
    await ds.query("select 1");
    services.database = true;
  } catch (err) {
    console.error("[health] db", err);
  }

  const ok = services.database;
  return NextResponse.json(
    { ok, service: "life-os", time: new Date().toISOString(), services },
    { status: ok ? 200 : 503 },
  );
}
