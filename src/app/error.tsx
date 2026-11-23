"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-sm">
        <p className="eyebrow">Something broke</p>
        <h1 className="mt-2 font-display text-2xl text-gold-soft">
          The system hit a wall.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Nothing was lost. Retry — if it keeps failing, check `/api/health`.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button type="button" variant="gold" onClick={reset}>
            Try again
          </Button>
          <Button type="button" variant="outline" onClick={() => (window.location.href = "/")}>
            Dashboard
          </Button>
        </div>
        {error.digest ? (
          <p className="mt-4 text-[10.5px] text-faint">Digest {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
