import Link from "next/link";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Offline</p>
        <h1 className="mt-2 font-display text-2xl text-gold-soft">No connection.</h1>
        <p className="mt-2 max-w-xs text-[13px] text-muted">
          The trophy room needs the network. The Telegram bot keeps working — answer there.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-[10px] border border-[rgba(200,162,75,0.4)] bg-surface-2 px-4 py-2 text-[13px] font-semibold text-gold-soft"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
