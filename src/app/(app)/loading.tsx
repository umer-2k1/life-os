export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="card h-[190px] animate-pulse bg-surface-2/40" />
        <div className="card h-[190px] animate-pulse bg-surface-2/40" />
      </div>
      <div className="card h-[130px] animate-pulse bg-surface-2/30" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card h-[220px] animate-pulse bg-surface-2/30" />
        <div className="card h-[220px] animate-pulse bg-surface-2/30" />
      </div>
    </div>
  );
}
