"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { motion } from "framer-motion";
import { BeanSpinner } from "@/components/brand/bean";
import { cn } from "@/lib/cn";

type MotionButtonVariant = "primary" | "secondary" | "inverse-fill" | "inverse-outline" | "ghost";

const variants: Record<MotionButtonVariant, string> = {
  primary:
    "bg-espresso text-cream hover:bg-mocha",
  secondary:
    "border border-espresso/35 text-espresso hover:border-espresso hover:bg-espresso/4",
  "inverse-fill":
    "bg-cream text-espresso hover:bg-latte",
  "inverse-outline":
    "border border-cream/35 text-cream hover:border-cream hover:bg-cream/6",
  ghost: "text-espresso hover:text-mocha",
};

const sizes = {
  sm: "min-h-11 px-[22px] py-3 text-[13px]",
  md: "min-h-12 px-6 py-3.5 text-sm",
  lg: "min-h-14 px-7 py-4 text-[15px]",
} as const;

type CommonProps = {
  variant?: MotionButtonVariant;
  size?: keyof typeof sizes;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
  className?: string;
};

export function MotionButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex">
      <Link
        {...rest}
        className={cn(
          "inline-flex items-center justify-center gap-2.5 rounded-pill font-semibold no-tap-highlight transition-colors duration-200",
          variants[variant],
          sizes[size],
          className,
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}

export function MotionButton({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Working",
  className,
  children,
  disabled,
  type = "button",
  onClick,
}: CommonProps &
  Pick<ComponentProps<"button">, "type" | "onClick" | "disabled" | "aria-busy" | "aria-label">) {
  const busy = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={busy}
      aria-busy={loading || undefined}
      whileHover={busy ? undefined : { scale: 1.03 }}
      whileTap={busy ? undefined : { scale: 0.97 }}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-pill font-semibold no-tap-highlight transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading ? (
        <>
          <BeanSpinner className="w-[0.85em]" />
          <span>{loadingLabel.replace(/\.{3}|…+$/u, "")}…</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
