"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createDreamAction, updateDreamAction, type FormState } from "./actions";

export type DreamFormValues = {
  id?: string;
  title?: string;
  priority?: "low" | "medium" | "high";
  status?: "active" | "achieved" | "paused";
  target_date?: string | null;
  money_needed?: string | null;
  progress?: number;
  importance_note?: string | null;
  cover_image_url?: string | null;
  glyph?: string | null;
  story?: string | null;
  emotional_reason?: string | null;
  feeling?: string | null;
};

const GLYPHS = ["🏎️", "🕋", "🎮", "🖥️", "💻", "💰", "🧠", "🚀", "🏠", "✈️", "💍", "📈", "🎯", "◆"];

export function DreamForm({ initial }: { initial?: DreamFormValues }) {
  const editing = Boolean(initial?.id);
  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updateDreamAction : createDreamAction,
    {},
  );
  const [glyph, setGlyph] = useState(initial?.glyph ?? "◆");

  return (
    <form action={action} className="space-y-4">
      {editing ? <input type="hidden" name="id" value={initial!.id} /> : null}
      <input type="hidden" name="glyph" value={glyph} />

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={initial?.title ?? ""} placeholder="Dream Car" required maxLength={120} />
      </div>

      <div>
        <Label>Glyph</Label>
        <div className="flex flex-wrap gap-1.5">
          {GLYPHS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGlyph(g)}
              aria-label={`Use ${g}`}
              aria-pressed={glyph === g}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-lg border text-[17px] transition-colors",
                glyph === g
                  ? "border-[rgba(200,162,75,0.6)] bg-[rgba(200,162,75,0.12)]"
                  : "border-border bg-surface-2 hover:border-[rgba(200,162,75,0.3)]",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <NativeSelect id="priority" name="priority" defaultValue={initial?.priority ?? "medium"}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor="target_date">Target date</Label>
          <Input id="target_date" name="target_date" type="date" defaultValue={initial?.target_date ?? ""} />
        </div>
        <div>
          <Label htmlFor="money_needed">Money needed (major units)</Label>
          <Input
            id="money_needed"
            name="money_needed"
            inputMode="decimal"
            placeholder="8000000"
            defaultValue={
              initial?.money_needed ? String(Number(initial.money_needed) / 100) : ""
            }
          />
        </div>
        <div>
          <Label htmlFor="cover_image_url">Cover image URL (optional)</Label>
          <Input id="cover_image_url" name="cover_image_url" type="url" defaultValue={initial?.cover_image_url ?? ""} placeholder="https://…" />
        </div>
      </div>

      {editing ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="progress">Progress %</Label>
            <Input id="progress" name="progress" type="number" min={0} max={100} defaultValue={initial?.progress ?? 0} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <NativeSelect id="status" name="status" defaultValue={initial?.status ?? "active"}>
              <option value="active">Active</option>
              <option value="achieved">Achieved</option>
              <option value="paused">Paused</option>
            </NativeSelect>
          </div>
        </div>
      ) : null}

      <div>
        <Label htmlFor="importance_note">Why it matters (one line)</Label>
        <Input id="importance_note" name="importance_note" defaultValue={initial?.importance_note ?? ""} placeholder="Proof that the work paid off." />
      </div>

      <div>
        <Label htmlFor="story">The story — why you want it</Label>
        <Textarea id="story" name="story" defaultValue={initial?.story ?? ""} placeholder="Keep it short. The feeling, not the essay." />
      </div>

      <div>
        <Label htmlFor="emotional_reason">Raw reason — a letter to yourself</Label>
        <Textarea
          id="emotional_reason"
          name="emotional_reason"
          defaultValue={initial?.emotional_reason ?? ""}
          placeholder="I don't want the car. I want to know I built the life that paid for it."
        />
      </div>

      <div>
        <Label htmlFor="feeling">Feeling (one word)</Label>
        <Input id="feeling" name="feeling" defaultValue={initial?.feeling ?? ""} placeholder="Inevitable" maxLength={60} />
      </div>

      {state.error ? <p className="text-[12.5px] text-red">{state.error}</p> : null}

      <Button type="submit" variant="gold" className="w-full" disabled={pending}>
        {pending ? "Saving…" : editing ? "Save dream" : "Add dream"}
      </Button>
    </form>
  );
}
