"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { changePinAction, type FormState } from "./actions";

function PinField({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        pattern="\d{6}"
        placeholder="••••••"
        className="h-11 text-center tracking-[0.4em]"
      />
    </div>
  );
}

export function PinForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    changePinAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <PinField name="current_pin" label="Current PIN" />
        <PinField name="new_pin" label="New PIN" />
        <PinField name="confirm_pin" label="Confirm new PIN" />
      </div>
      {state.error ? <p className="text-[12.5px] text-red">{state.error}</p> : null}
      {state.ok ? <p className="text-[12.5px] text-green">PIN changed.</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Changing…" : "Change PIN"}
      </Button>
    </form>
  );
}
