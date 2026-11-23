"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp";

export function PinInput({
  value,
  onChange,
  onComplete,
  autoFocus,
  disabled,
  invalid,
  size = "default",
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  size?: "default" | "compact";
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <InputOTP
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      autoFocus={autoFocus}
      disabled={disabled}
      aria-label={ariaLabel ?? "6-digit PIN"}
      aria-invalid={invalid || undefined}
      containerClassName={cn("justify-center", className)}
    >
      <InputOTPGroup>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className={
              size === "compact"
                ? "h-[46px] w-[38px] text-[18px]"
                : undefined
            }
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
