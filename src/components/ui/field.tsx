"use client";

import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

const controlBase =
  "w-full min-h-12 rounded-sm border bg-surface px-3.5 py-3 text-[15px] text-fg " +
  "placeholder:text-muted/70 transition-[border-color,box-shadow] duration-fast ease-brand " +
  "hover:border-latte disabled:cursor-not-allowed disabled:bg-latte-50/60 disabled:opacity-60";

function FieldFrame({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline gap-2 text-[14px] font-medium">
        {label}
        {optional ? <span className="t-caption">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="t-caption">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export function TextField({
  label,
  hint,
  error,
  optional,
  className,
  id: providedId,
  ...rest
}: FieldProps & ComponentProps<"input">) {
  const generated = useId();
  const id = providedId ?? generated;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional}>
      <input
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlBase, error ? "border-error" : "border-line", className)}
      />
    </FieldFrame>
  );
}

export function TextArea({
  label,
  hint,
  error,
  optional,
  className,
  id: providedId,
  ...rest
}: FieldProps & ComponentProps<"textarea">) {
  const generated = useId();
  const id = providedId ?? generated;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlBase, "min-h-24 resize-y leading-relaxed", error ? "border-error" : "border-line", className)}
      />
    </FieldFrame>
  );
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  className,
  id: providedId,
  children,
  ...rest
}: FieldProps & ComponentProps<"select">) {
  const generated = useId();
  const id = providedId ?? generated;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional}>
      <div className="relative">
        <select
          {...rest}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            controlBase,
            "appearance-none pr-10",
            error ? "border-error" : "border-line",
            className,
          )}
        >
          {children}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-muted"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </FieldFrame>
  );
}

/** Segmented choice list — used for grind, bag size, cup size and fulfilment. */
export function ChoiceGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  columns = 2,
  className,
}: {
  legend: string;
  options: Array<{ value: T; label: string; hint?: string; disabled?: boolean; meta?: string }>;
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const gridCols =
    columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";

  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className="t-label mb-1">{legend}</legend>
      <div className={cn("grid gap-2", gridCols)}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-11 cursor-pointer flex-col justify-center gap-0.5 rounded-sm border px-3.5 py-2.5",
                "transition-[border-color,background-color,color] duration-fast ease-brand no-tap-highlight",
                "has-focus-visible:outline has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-latte",
                selected
                  ? "border-espresso bg-espresso text-cream"
                  : "border-line bg-surface text-fg hover:border-latte",
                option.disabled && "cursor-not-allowed opacity-45 hover:border-line",
              )}
            >
              <input
                type="radio"
                name={legend}
                value={option.value}
                checked={selected}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="flex items-baseline justify-between gap-2 text-[14px] font-medium">
                {option.label}
                {option.meta ? (
                  <span className={cn("font-mono text-[11px]", selected ? "text-latte" : "text-muted")}>
                    {option.meta}
                  </span>
                ) : null}
              </span>
              {option.hint ? (
                <span className={cn("text-[12px]", selected ? "text-cream/65" : "text-muted")}>
                  {option.hint}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Checkbox({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-sm py-1",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className="grid pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            "grid h-5 w-5 place-items-center rounded-xs border transition-colors duration-fast ease-brand",
            "peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-latte",
            checked ? "border-espresso bg-espresso text-cream" : "border-line bg-surface",
          )}
        >
          {checked ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="h-3 w-3">
              <path d="m5 13 4 4L19 7" />
            </svg>
          ) : null}
        </span>
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium">{label}</span>
        {description ? <span className="t-caption">{description}</span> : null}
      </span>
    </label>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = "Quantity",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div
      className="inline-flex items-center rounded-sm border border-line bg-surface"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="grid h-11 w-11 place-items-center rounded-l-sm text-espresso transition-colors duration-fast ease-brand hover:bg-latte-50 disabled:opacity-35 disabled:hover:bg-transparent no-tap-highlight"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4">
          <path d="M5 12h14" />
        </svg>
      </button>
      <span aria-live="polite" className="w-9 text-center font-mono text-[14px] tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="grid h-11 w-11 place-items-center rounded-r-sm text-espresso transition-colors duration-fast ease-brand hover:bg-latte-50 disabled:opacity-35 disabled:hover:bg-transparent no-tap-highlight"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
