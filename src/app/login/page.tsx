import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
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
  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/";

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-18%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.14),transparent_65%)]"
      />

      <div className="relative w-full max-w-[400px] motion-safe:animate-[rise_0.35s_ease_both]">
        <div className="mb-7 flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-12 w-12 place-items-center rounded-[13px] bg-[linear-gradient(145deg,var(--gold),#8a6d28)] font-display text-2xl font-semibold text-[#0A0A0B] shadow-[inset_0_0_0_1px_rgba(231,212,162,0.3),0_10px_30px_-12px_rgba(200,162,75,0.6)]"
          >
            L
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
              Private workspace
            </p>
            <h1 className="truncate font-display text-[22px] leading-tight">
              The Life I&apos;m Building
            </h1>
          </div>
        </div>

        <div className="card relative overflow-hidden rounded-[20px] p-6 sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.12),transparent_70%)]"
          />
          <blockquote className="relative border-l-2 border-[rgba(200,162,75,0.45)] pl-3 font-display text-[14.5px] italic leading-relaxed text-gold-soft">
            &ldquo;Make a shit ton of money. Nobody cares about it.&rdquo;
          </blockquote>

          <LoginForm next={next} />
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-[10.5px] text-faint">
          <Lock size={11} aria-hidden />
          Single owner · PIN hashed · your own database
        </div>
      </div>
    </main>
  );
}
