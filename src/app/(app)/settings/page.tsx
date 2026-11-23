import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/core/profile";
import { env, hasAI, hasCloudinary, hasResend, hasTelegram } from "@/lib/env";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import { PinForm } from "./pin-form";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Settings" };

function Integration({
  name,
  detail,
  on,
}: {
  name: string;
  detail: string;
  on: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-border py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="text-[13.5px]">{name}</p>
        <p className="text-[11.5px] text-faint">{detail}</p>
      </div>
      <Badge tone={on ? "green" : "muted"}>{on ? "connected" : "missing"}</Badge>
    </li>
  );
}

export default async function SettingsPage() {
  const [profile, session] = await Promise.all([getProfile(), getSession()]);
  const e = env();

  return (
    <div className="max-w-3xl space-y-4 motion-safe:animate-[rise_0.3s_ease_both]">
      <header>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-1 font-display text-2xl">Your system</h1>
        <p className="mt-1 text-[12.5px] text-muted">
          Signed in · single owner · session expires in 30 days.
        </p>
      </header>

      <section className="card">
        <p className="eyebrow">Identity &amp; North Star</p>
        <div className="mt-3">
          <ProfileForm
            profile={{
              display_name: profile.display_name ?? null,
              north_star_amount: profile.north_star_amount ?? null,
              north_star_label: profile.north_star_label ?? null,
              identity_line: profile.identity_line ?? null,
              motto: profile.motto,
              timezone: profile.timezone,
              currency: profile.currency,
            }}
          />
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">Security</p>
        <p className="mt-1.5 text-[12.5px] text-muted">
          Your PIN is hashed (scrypt) before storage. 8 attempts per 10 minutes, then locked.
        </p>
        <div className="mt-3">
          <PinForm />
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">Integrations</p>
        <ul className="mt-2">
          <Integration name="AI (OpenRouter / Groq)" detail="Parsing, scoring, recaps, reports" on={hasAI()} />
          <Integration name="Cloudinary" detail={`Image uploads${e.CLOUDINARY_CLOUD_NAME ? ` · ${e.CLOUDINARY_CLOUD_NAME}` : ""}`} on={hasCloudinary()} />
          <Integration name="Telegram" detail="Daily ask and voice notes" on={hasTelegram()} />
          <Integration name="Resend" detail="Emailed reports" on={hasResend()} />
          <Integration name="MCP" detail="/api/mcp · bearer token" on={Boolean(e.MCP_AUTH_TOKEN)} />
        </ul>
      </section>

      <section className="card flex items-center justify-between gap-4">
        <div>
          <p className="text-[13.5px]">Sign out of this device</p>
          <p className="text-[11.5px] text-faint">Clears the httpOnly session cookie.</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">Sign out</Button>
        </form>
      </section>

      {!session ? (
        <p className="text-[12px] text-red">Session missing — sign in again.</p>
      ) : null}
    </div>
  );
}
