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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          placeholder="••••••••"
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
    </form>
  );
}
