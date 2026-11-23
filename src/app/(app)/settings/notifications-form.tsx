"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { NotificationPrefs } from "@/db/entities";
import { updateNotificationsAction, type FormState } from "./actions";

export function NotificationsForm({ prefs }: { prefs: NotificationPrefs }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateNotificationsAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="daily_ask_time">Daily ask (local time)</Label>
          <Input id="daily_ask_time" name="daily_ask_time" type="time" defaultValue={prefs.daily_ask_time} />
        </div>
        <div>
          <Label htmlFor="reask_gap_hours">Re-ask every (hours)</Label>
          <Input id="reask_gap_hours" name="reask_gap_hours" type="number" min={1} max={24} defaultValue={prefs.reask_gap_hours} />
        </div>
        <div>
          <Label htmlFor="quiet_start">Quiet from</Label>
          <Input id="quiet_start" name="quiet_start" type="time" defaultValue={prefs.quiet_start} />
        </div>
        <div>
          <Label htmlFor="quiet_end">Quiet until</Label>
          <Input id="quiet_end" name="quiet_end" type="time" defaultValue={prefs.quiet_end} />
        </div>
      </div>

      <fieldset className="flex flex-wrap gap-4 text-[12.5px] text-muted">
        <legend className="sr-only">Channels</legend>
        {(["telegram", "web", "email"] as const).map((c) => (
          <label key={c} className="flex items-center gap-2 capitalize">
            <input
              type="checkbox"
              name={`channel_${c}`}
              defaultChecked={Boolean(prefs.channels?.[c])}
              className="h-4 w-4 accent-[var(--gold)]"
            />
            {c}
          </label>
        ))}
      </fieldset>

      {state.error ? <p className="text-[12.5px] text-red">{state.error}</p> : null}
      {state.ok ? <p className="text-[12.5px] text-green">Saved.</p> : null}

      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Saving…" : "Save notifications"}
      </Button>
    </form>
  );
}
