"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { updateAiAction, type FormState } from "./actions";

export function AiForm({
  masked,
  models,
  selected,
}: {
  masked: Record<string, string | null>;
  models: Array<{ id: string; name: string }>;
  selected: string | null;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateAiAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {(["groq", "openrouter", "grok", "deepseek"] as const).map((p) => (
          <div key={p}>
            <Label htmlFor={`key_${p}`}>
              {p === "grok" ? "Grok (xAI)" : p} key {masked[p] ? `· ${masked[p]}` : ""}
            </Label>
            <Input
              id={`key_${p}`}
              name={`key_${p}`}
              type="password"
              autoComplete="off"
              placeholder={masked[p] ? "Saved — paste to replace" : "Not set"}
            />
          </div>
        ))}
      </div>

      <div>
        <Label htmlFor="selected_model">OpenRouter model (blank = auto free)</Label>
        <NativeSelect id="selected_model" name="selected_model" defaultValue={selected ?? ""}>
          <option value="">Auto — first working free model</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </NativeSelect>
      </div>

      {state.error ? <p className="text-[12.5px] text-red">{state.error}</p> : null}
      {state.ok ? <p className="text-[12.5px] text-green">AI settings saved.</p> : null}

      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Saving…" : "Save AI settings"}
      </Button>
    </form>
  );
}
