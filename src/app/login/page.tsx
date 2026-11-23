import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Enter" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/");
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/";

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-11 w-11 place-items-center rounded-xl bg-[linear-gradient(145deg,var(--gold),#8a6d28)] font-display text-2xl font-semibold text-[#0A0A0B] shadow-[inset_0_0_0_1px_rgba(231,212,162,0.3)]"
          >
            L
          </span>
          <div>
            <p className="eyebrow">Private</p>
            <h1 className="font-display text-2xl">The Life I&apos;m Building</h1>
          </div>
        </div>
        <p className="mt-6 font-display text-[15px] italic leading-relaxed text-gold-soft">
          &ldquo;Make a shit ton of money. Nobody cares about it.&rdquo;
        </p>
        <LoginForm next={next} />
        <p className="mt-6 text-[11.5px] leading-relaxed text-faint">
          Single-user gate. Everything stays on your own database.
        </p>
      </div>
    </main>
  );
}
