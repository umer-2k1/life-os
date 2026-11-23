"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Sheet({
  open,
  title,
  children,
  className,
  closeHref = "/dreams",
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  className?: string;
  closeHref?: string;
}) {
  const router = useRouter();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) router.push(closeHref);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(5,5,6,0.72)] backdrop-blur-[3px] motion-safe:animate-[fade_0.2s_ease_both]" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-50 overflow-y-auto border border-border bg-surface shadow-2xl",
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[20px]",
            "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[88dvh] sm:w-[min(680px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[20px]",
            "motion-safe:animate-[rise_0.25s_ease_both]",
            className,
          )}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-surface/95 px-5 py-3 backdrop-blur">
            <Dialog.Title className="font-display text-lg">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-2 text-muted hover:text-fg"
              >
                <X size={15} aria-hidden />
              </button>
            </Dialog.Close>
          </div>
          <div className="px-5 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
