"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDreamAction } from "./actions";

export function DeleteDreamButton({ dreamId }: { dreamId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button type="button" variant="danger" size="sm" onClick={() => setConfirming(true)}>
        <Trash2 size={13} aria-hidden /> Delete
      </Button>
    );
  }

  return (
    <form
      action={deleteDreamAction}
      onSubmit={() => router.refresh()}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="id" value={dreamId} />
      <span className="text-[11.5px] text-red">Delete this dream?</span>
      <Button type="submit" variant="danger" size="sm">Yes, delete</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
    </form>
  );
}
