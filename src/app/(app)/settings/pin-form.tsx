"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { PinInput } from "@/components/ui/pin-input";
import { changePinAction, type FormState } from "./actions";

function PinRow({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" id={name} name={name} value={value} />
      <PinInput
        value={value}
        onChange={onChange}
        size="compact"
        className="justify-start"
        aria-label={label}
      />
    </div>
  );
}

export function PinForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    changePinAction,
    {},
  );
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <PinRow label="Current PIN" name="current_pin" value={current} onChange={setCurrent} />
        <PinRow label="New PIN" name="new_pin" value={next} onChange={setNext} />
        <PinRow label="Confirm new PIN" name="confirm_pin" value={confirm} onChange={setConfirm} />
      </div>
      {state.error ? <p className="text-[12.5px] text-red">{state.error}</p> : null}
      {state.ok ? <p className="text-[12.5px] text-green">PIN changed. Use it next time.</p> : null}
      <Button
        type="submit"
        disabled={pending || current.length < 6 || next.length < 6 || confirm.length < 6}
      >
        {pending ? "Changing…" : "Change PIN"}
      </Button>
    </form>
  );
}
