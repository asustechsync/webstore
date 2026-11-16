import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-control border border-border bg-surface px-3 text-sm text-foreground",
        "placeholder:text-foreground-muted",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
        invalid && "border-danger",
        className,
      )}
      {...props}
    />
  );
}
