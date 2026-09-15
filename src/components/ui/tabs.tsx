"use client";

import { cn } from "@/lib/cn";

/**
 * Horizontal filter rail. Scrolls on mobile without a visible scrollbar and
 * wraps to a normal row from tablet up.
 */
export function FilterRail<T extends string>({
  label,
  options,
  value,
  onChange,
  bleed = true,
  className,
}: {
  label: string;
  options: Array<{ value: T; label: string; count?: number }>;
  value: T;
  onChange: (value: T) => void;
  /** Scroll edge-to-edge past the page gutter. Turn off inside a card. */
  bleed?: boolean;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "rail gap-2 pb-1 sm:flex-wrap",
        bleed && "-mx-[var(--mx)] px-[var(--mx)] sm:mx-0 sm:px-0",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-11 shrink-0 scroll-ml-[var(--mx)] snap-start rounded-full border px-4 text-[13.5px] font-medium",
              "transition-[background-color,color,border-color] duration-fast ease-brand no-tap-highlight",
              selected
                ? "border-espresso bg-espresso text-cream"
                : "border-line bg-surface text-mocha hover:border-latte hover:text-fg",
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span className={cn("ml-2 font-mono text-[11px]", selected ? "text-latte" : "text-muted")}>
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Two-up segmented control, used for pickup/delivery and one-off/subscribe. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: Array<{ value: T; label: string; hint?: string }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "grid gap-1 rounded-sm border border-line bg-surface p-1",
        options.length === 2 ? "grid-cols-2" : "grid-cols-3",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center rounded-xs px-3 py-2 text-[13.5px] font-medium",
              "transition-[background-color,color] duration-fast ease-brand no-tap-highlight",
              selected ? "bg-espresso text-cream" : "text-mocha hover:bg-latte-50",
            )}
          >
            {option.label}
            {option.hint ? (
              <span className={cn("text-[11px] font-normal", selected ? "text-cream/60" : "text-muted")}>
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Numbered progress stepper for the ordering flow. */
export function Stepper({
  steps,
  current,
  onStepSelect,
  bleed = true,
  className,
}: {
  steps: string[];
  current: number;
  onStepSelect?: (index: number) => void;
  /** Scroll edge-to-edge past the page gutter. Turn off inside a card. */
  bleed?: boolean;
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "rail items-center gap-1",
        bleed && "-mx-[var(--mx)] px-[var(--mx)] sm:mx-0 sm:px-0",
        className,
      )}
    >
      {steps.map((step, index) => {
        const state = index < current ? "done" : index === current ? "current" : "todo";
        const reachable = index < current && Boolean(onStepSelect);

        return (
          <li key={step} className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              disabled={!reachable}
              onClick={reachable ? () => onStepSelect?.(index) : undefined}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "flex min-h-9 items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-fast ease-brand",
                state === "current" && "bg-espresso text-cream",
                state === "done" && "text-mocha hover:bg-latte-50",
                state === "todo" && "cursor-default text-muted",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full font-mono text-[10px]",
                  state === "current" && "bg-latte text-espresso",
                  state === "done" && "bg-latte-200 text-espresso",
                  state === "todo" && "border border-line text-muted",
                )}
              >
                {state === "done" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="h-2.5 w-2.5">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              {step}
            </button>
            {index < steps.length - 1 ? (
              <span aria-hidden="true" className="h-px w-4 bg-line sm:w-6" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
