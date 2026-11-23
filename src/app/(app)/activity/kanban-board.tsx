"use client";

import { useState, useTransition } from "react";
import type { KanbanColumn } from "@/db/entities";
import { moveActivityAction } from "./actions";
import { cn } from "@/lib/utils";

export type BoardActivity = {
  id: string;
  text: string;
  relevance: "on_track" | "neutral" | "waste";
  score_delta: number;
  time_cost_days: number;
  suggestion: string | null;
  column: KanbanColumn;
  dream_title: string | null;
  dream_glyph: string | null;
};

const COLUMNS: Array<{ key: KanbanColumn; label: string; tone: string }> = [
  { key: "today", label: "Today", tone: "text-muted" },
  { key: "doing", label: "Doing", tone: "text-amber" },
  { key: "done", label: "Done", tone: "text-green" },
  { key: "wasted", label: "Wasted", tone: "text-red" },
];

const STRIPE: Record<string, string> = {
  on_track: "bg-green",
  neutral: "bg-amber",
  waste: "bg-red",
};

const LABEL: Record<string, string> = {
  on_track: "ON TRACK",
  neutral: "NEUTRAL",
  waste: "WASTE",
};

export function KanbanBoard({ initial }: { initial: BoardActivity[] }) {
  const [items, setItems] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function move(id: string, column: KanbanColumn) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, column } : a)));
    startTransition(() => {
      void moveActivityAction(id, column);
    });
  }

  function step(id: string, direction: 1 | -1) {
    const item = items.find((a) => a.id === id);
    if (!item) return;
    const idx = COLUMNS.findIndex((c) => c.key === item.column);
    const next = COLUMNS[Math.max(0, Math.min(COLUMNS.length - 1, idx + direction))];
    if (next.key !== item.column) move(id, next.key);
  }

  return (
    <div className="grid grid-cols-[repeat(4,minmax(230px,1fr))] gap-3 overflow-x-auto pb-2 md:grid-cols-4">
      {COLUMNS.map((col) => {
        const cards = items.filter((a) => a.column === col.key);
        return (
          <section
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragging) move(dragging, col.key);
              setDragging(null);
            }}
            className="min-h-[220px] rounded-[14px] border border-border bg-surface/60 p-2.5"
          >
            <header className="flex items-center justify-between px-0.5 pb-2">
              <h3 className={cn("text-[11px] font-bold uppercase tracking-[0.13em]", col.tone)}>
                {col.label}
              </h3>
              <span className="tnum text-[11px] text-faint">{cards.length}</span>
            </header>

            <div className="space-y-2">
              {cards.map((a) => (
                <article
                  key={a.id}
                  draggable
                  onDragStart={() => setDragging(a.id)}
                  onDragEnd={() => setDragging(null)}
                  className={cn(
                    "group relative cursor-grab overflow-hidden rounded-[11px] border border-border bg-surface pl-3 pr-2.5 py-2.5 active:cursor-grabbing",
                    dragging === a.id ? "opacity-50" : "",
                  )}
                >
                  <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", STRIPE[a.relevance])} />
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9.5px] font-bold tracking-[0.08em] text-faint">
                      {LABEL[a.relevance]}
                    </span>
                    <span className="tnum flex-none text-[10.5px] font-semibold">
                      {a.relevance === "waste" ? (
                        <span className="text-red">+{a.time_cost_days}d</span>
                      ) : (
                        <span className="text-green">+{a.score_delta}</span>
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-snug">{a.text}</p>
                  {a.dream_title ? (
                    <p className="mt-1 text-[10.5px] text-faint">
                      {a.dream_glyph ?? "◆"} {a.dream_title}
                    </p>
                  ) : null}
                  {a.suggestion ? (
                    <p className="mt-1.5 border-t border-dashed border-border pt-1.5 text-[10.5px] leading-snug text-muted">
                      {a.suggestion}
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => step(a.id, -1)}
                        aria-label="Move left"
                        className="rounded border border-border px-1.5 text-[11px] text-muted hover:text-fg"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => step(a.id, 1)}
                        aria-label="Move right"
                        className="rounded border border-border px-1.5 text-[11px] text-muted hover:text-fg"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {cards.length === 0 ? (
                <p className="px-1 py-6 text-center text-[11px] text-faint">Empty</p>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
