import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Mark } from "@/components/brand/mark";

export function Card({
  children,
  className,
  dark = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        // min-w-0: a card must never be sized by its content when it is a grid
        // or flex item, or scrollable rails inside it push the page wider.
        "min-w-0 rounded-md border p-6",
        dark ? "border-espresso bg-espresso text-cream" : "border-line bg-surface text-fg",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Numbered section header. Mirrors the foundations rhythm: mono index in latte,
 * serif title, right-aligned supporting line that reflows below on mobile.
 */
export function SectionHead({
  index,
  title,
  sub,
  id,
  className,
  tone = "light",
}: {
  index?: string;
  title: string;
  sub?: string;
  id?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-3 sm:mb-10",
        className,
      )}
    >
      {index ? (
        <span className="pt-1.5 font-mono text-[13px] font-medium tracking-[0.1em] text-accent">
          {index}
        </span>
      ) : null}
      <h2 id={id} className={cn("t-display-m", tone === "dark" && "text-cream")}>
        {title}
      </h2>
      {sub ? (
        <p
          className={cn(
            "order-3 w-full max-w-[34ch] text-[14.5px] leading-relaxed sm:order-none sm:ml-auto sm:w-auto sm:text-right",
            tone === "dark" ? "text-cream/62" : "text-muted",
          )}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}

/** Full-bleed espresso band used for dark editorial sections. */
export function DarkBand({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-espresso text-cream", className)}>{children}</section>
  );
}

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-md border border-dashed border-line bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      <Mark className="w-7 opacity-45" />
      <h3 className="t-h2">{title}</h3>
      <p className="max-w-[42ch] text-[14.5px] leading-relaxed text-muted">{body}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

/** Inline notice: validation, delivery thresholds, sold-out explanations. */
export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-info/35 bg-[color-mix(in_oklab,var(--color-info),var(--color-cream)_88%)] text-[#3f4c52]",
    success:
      "border-success/35 bg-[color-mix(in_oklab,var(--color-success),var(--color-cream)_88%)] text-[#3d5136]",
    warning:
      "border-warning/40 bg-[color-mix(in_oklab,var(--color-warning),var(--color-cream)_88%)] text-[#6d4e17]",
    error:
      "border-error/40 bg-[color-mix(in_oklab,var(--color-error),var(--color-cream)_88%)] text-[#7a3522]",
  } as const;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-sm border px-4 py-3 text-[13.5px] leading-relaxed", tones[tone], className)}
    >
      {title ? <strong className="font-semibold">{title} </strong> : null}
      {children}
    </div>
  );
}

/** Skeleton block for loading states. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-sm bg-[color-mix(in_oklab,var(--color-latte),var(--color-cream)_62%)]",
        className,
      )}
    />
  );
}
