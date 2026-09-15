"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { MarkSpinner } from "@/components/brand/mark";

/**
 * Primary actions are espresso-solid, never latte — the accent stays rationed.
 * Motion is the standard 260ms token on the shared brand easing.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2.5 rounded-sm font-medium no-tap-highlight " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-std ease-brand " +
  "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none active:translate-y-px " +
  "disabled:active:translate-y-0";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-espresso text-cream hover:bg-mocha hover:shadow-md",
  secondary:
    "border border-espresso bg-transparent text-espresso hover:bg-espresso hover:text-cream",
  ghost: "bg-transparent text-espresso hover:bg-latte-50",
  inverse:
    "border border-cream/25 bg-transparent text-cream hover:border-cream/55 hover:bg-cream/10",
  danger: "bg-error text-cream hover:bg-error/90",
};

const sizes: Record<ButtonSize, string> = {
  // Every size clears the 44px minimum tap target from the a11y foundation.
  sm: "min-h-11 px-4 text-[13px]",
  md: "min-h-12 px-5 text-[14px]",
  lg: "min-h-14 px-7 text-[15px]",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  block?: boolean;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Working",
  block = false,
  className,
  children,
  disabled,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
    >
      {loading ? (
        <>
          <MarkSpinner className="w-[0.85em]" />
          <span>{loadingLabel}…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  block = false,
  className,
  children,
  ...rest
}: Omit<CommonProps, "loading" | "loadingLabel"> & ComponentProps<typeof Link>) {
  return (
    <Link
      {...rest}
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
    >
      {children}
    </Link>
  );
}

/** The arrow that travels 4px on hover, from the motion foundation. */
export function TravelArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        "h-4 w-4 transition-transform duration-std ease-brand group-hover:translate-x-1",
        className,
      )}
    >
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/** Square icon-only control, sized to the 44px minimum. */
export function IconButton({
  label,
  className,
  children,
  ...rest
}: { label: string; children: ReactNode; className?: string } & ComponentProps<"button">) {
  return (
    <button
      {...rest}
      aria-label={label}
      className={cn(
        "inline-grid h-11 w-11 place-items-center rounded-sm text-espresso no-tap-highlight",
        "transition-colors duration-fast ease-brand hover:bg-latte-50 disabled:opacity-45",
        className,
      )}
    >
      {children}
    </button>
  );
}
