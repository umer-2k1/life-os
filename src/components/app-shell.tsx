import Link from "next/link";
import type { ReactNode } from "react";
import { LiveClock } from "./live-clock";
import { NavTabs } from "./nav-tabs";

export function AppShell({
  motto,
  children,
}: {
  motto: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-[rgba(13,13,15,0.82)] backdrop-blur-[14px]">
        <div className="wrap gutter flex items-center gap-4 py-3.5">
          <Link href="/" className="mr-auto flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg bg-[linear-gradient(145deg,var(--gold),#8a6d28)] font-display text-[17px] font-semibold text-[#0A0A0B] shadow-[inset_0_0_0_1px_rgba(231,212,162,0.25)]"
            >
              L
            </span>
            <b className="truncate font-display text-base font-medium tracking-[0.2px]">
              The Life I&apos;m Building
            </b>
          </Link>
          <NavTabs />
          <LiveClock className="hidden whitespace-nowrap text-[12.5px] text-muted sm:block" />
        </div>
      </header>

      <div className="border-b border-border bg-[linear-gradient(180deg,rgba(200,162,75,0.05),transparent)]">
        <div className="wrap gutter flex items-center gap-3 py-[11px]">
          <span
            aria-hidden
            className="h-1.5 w-1.5 flex-none rounded-full bg-gold shadow-[0_0_10px_var(--gold)] motion-safe:animate-[glow_2.6s_ease-in-out_infinite]"
          />
          <p className="font-display text-[15px] italic tracking-[0.2px] text-gold-soft">
            {motto}
          </p>
        </div>
      </div>

      <main className="wrap gutter w-full flex-1 py-6 pb-20">{children}</main>

      <footer className="wrap gutter pb-8 text-[11px] text-faint">
        Private · single user · the bot is the product, this is the trophy room.
      </footer>
    </div>
  );
}
