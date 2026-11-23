import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ensureBootstrap } from "@/core/bootstrap";
import { getProfile } from "@/core/profile";

// Authenticated, database-backed: never prerender at build time.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await ensureBootstrap();
  const profile = await getProfile();
  return <AppShell motto={profile.motto}>{children}</AppShell>;
}
