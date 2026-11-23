"use client";

import { useActionState, useRef, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/ui/pin-input";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );
  const [pin, setPin] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const invalid = Boolean(state.error);

  return (
    <form ref={formRef} action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="pin" value={pin} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            Enter your PIN
          </p>
          <span className="text-[10.5px] text-faint">6 digits</span>
        </div>

        <div
          key={state.error ?? "pin"}
          className={invalid ? "motion-safe:animate-[shake_0.35s_ease]" : ""}
        >
          <PinInput
            value={pin}
            onChange={setPin}
            autoFocus
            disabled={pending}
            invalid={invalid}
            aria-label="6-digit PIN"
            onComplete={(value) => {
              if (value.length !== 6 || pending) return;
              const hidden = formRef.current?.querySelector<HTMLInputElement>(
                'input[name="pin"]',
              );
              if (hidden) hidden.value = value;
              formRef.current?.requestSubmit();
            }}
          />
        </div>

        <div className="min-h-[18px]">
          {state.error ? (
            <p role="alert" className="text-center text-[12px] text-red">
              {state.error}
            </p>
          ) : (
            <p className="text-center text-[11px] text-faint">
              It submits itself when the last digit lands.
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        className="group w-full"
        disabled={pending || pin.length < 6}
      >
        {pending ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden /> Checking
          </>
        ) : (
          <>
            Enter
            <ArrowRight
              size={15}
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-[10.5px] text-faint">
        <span className="h-1 w-1 rounded-full bg-gold/70" aria-hidden />
        First run PIN <span className="tnum text-muted">252525</span>
        <span aria-hidden>·</span>
        change it in Settings
      </div>
    </form>
  );
}
