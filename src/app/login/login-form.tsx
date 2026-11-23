"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <Label htmlFor="pin">6-digit PIN</Label>
        <Input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
          maxLength={6}
          pattern="\d{6}"
          placeholder="••••••"
          className="h-14 text-center font-display text-2xl tracking-[0.55em] placeholder:tracking-[0.4em]"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-[12.5px] text-red">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={pending}>
        {pending ? "Opening…" : "Enter"}
      </Button>
      <p className="text-center text-[11px] text-faint">
        Default PIN is <span className="tnum text-muted">252525</span> — change it in Settings.
      </p>
    </form>
  );
}
