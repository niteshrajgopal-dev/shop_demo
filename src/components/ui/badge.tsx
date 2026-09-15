import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "neutral"
  | "outline"
  | "espresso"
  | "latte"
  | "success"
  | "warning"
  | "error"
  | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-latte-50 text-mocha",
  outline: "border border-line bg-transparent text-muted",
  espresso: "bg-espresso text-latte",
  latte: "bg-latte text-espresso",
  success: "bg-[color-mix(in_oklab,var(--color-success),var(--color-cream)_74%)] text-[#3d5136]",
  warning: "bg-[color-mix(in_oklab,var(--color-warning),var(--color-cream)_70%)] text-[#6d4e17]",
  error: "bg-[color-mix(in_oklab,var(--color-error),var(--color-cream)_74%)] text-[#7a3522]",
  info: "bg-[color-mix(in_oklab,var(--color-info),var(--color-cream)_74%)] text-[#3f4c52]",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-mono text-[10px]",
        "font-medium tracking-[0.1em] uppercase leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Mono, wide-tracked eyebrow used above section and card titles. */
export function Overline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("t-overline text-muted", className)}>{children}</span>;
}
