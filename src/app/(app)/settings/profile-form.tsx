"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { updateProfileAction, type FormState } from "./actions";

export type ProfileFormValues = {
  display_name: string | null;
  north_star_amount: string | null;
  north_star_label: string | null;
  identity_line: string | null;
  motto: string;
  timezone: string;
  currency: string;
};

export function ProfileForm({ profile }: { profile: ProfileFormValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateProfileAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="display_name">Display name</Label>
          <Input id="display_name" name="display_name" defaultValue={profile.display_name ?? ""} placeholder="Your name" />
        </div>
        <div>
          <Label htmlFor="north_star_amount">North Star (major units)</Label>
          <Input
            id="north_star_amount"
            name="north_star_amount"
            inputMode="decimal"
            defaultValue={
              profile.north_star_amount ? String(Number(profile.north_star_amount) / 100) : ""
            }
            placeholder="10000000"
          />
        </div>
        <div>
          <Label htmlFor="north_star_label">North Star label</Label>
          <Input id="north_star_label" name="north_star_label" defaultValue={profile.north_star_label ?? ""} placeholder="Net worth" />
        </div>
        <div>
          <Label htmlFor="identity_line">Identity line</Label>
          <Input id="identity_line" name="identity_line" defaultValue={profile.identity_line ?? ""} placeholder="I'm becoming someone who closes clients." />
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" name="timezone" defaultValue={profile.timezone} placeholder="Asia/Karachi" />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <NativeSelect id="currency" name="currency" defaultValue={profile.currency}>
            {["PKR", "USD", "EUR", "GBP", "AED", "SAR", "INR"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div>
        <Label htmlFor="motto">Motto strip</Label>
        <Textarea id="motto" name="motto" defaultValue={profile.motto} className="min-h-16" />
      </div>

      {state.error ? <p className="text-[12.5px] text-red">{state.error}</p> : null}
      {state.ok ? <p className="text-[12.5px] text-green">Saved.</p> : null}

      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
