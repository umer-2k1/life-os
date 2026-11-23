"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectTelegramAction, type FormState } from "./actions";

export function TelegramConnect() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    connectTelegramAction,
    {},
  );

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        <Send size={13} aria-hidden />
        {pending ? "Registering…" : "Register webhook"}
      </Button>
      {state.ok ? <span className="text-[11.5px] text-green">{state.message}</span> : null}
      {state.error ? <span className="text-[11.5px] text-red">{state.error}</span> : null}
    </form>
  );
}
