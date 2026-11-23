import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-2 font-display text-2xl text-gold-soft">Not here.</h1>
        <p className="mt-2 text-[13px] text-muted">That page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-[10px] border border-[rgba(200,162,75,0.4)] bg-surface-2 px-4 py-2 text-[13px] font-semibold text-gold-soft"
        >
          Back to the trophy room
        </Link>
      </div>
    </main>
  );
}
