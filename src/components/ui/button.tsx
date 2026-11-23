import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[13px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]",
  {
    variants: {
      variant: {
        default:
          "bg-surface-2 text-gold-soft border border-[rgba(200,162,75,0.4)] hover:bg-surface-3",
        gold:
          "bg-[linear-gradient(145deg,var(--gold),#8a6d28)] text-[#0A0A0B] hover:brightness-110 border border-transparent",
        ghost: "text-muted hover:text-fg hover:bg-surface-2 border border-transparent",
        outline:
          "border border-border bg-transparent text-fg hover:border-[rgba(200,162,75,0.4)] hover:text-gold-soft",
        danger:
          "border border-[rgba(228,86,74,0.4)] bg-[rgba(228,86,74,0.08)] text-red hover:bg-[rgba(228,86,74,0.14)]",
      },
      size: {
        default: "h-9 px-3.5",
        sm: "h-8 px-2.5 text-[12px]",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
