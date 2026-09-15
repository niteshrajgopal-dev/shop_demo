"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Modal sheet. Slides from the right on desktop and up from the bottom on
 * mobile, traps focus, closes on Escape and restores focus on unmount.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "bottom";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreTo.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const isBottom = side === "bottom";

  return (
    <div className="fixed inset-0 z-100 flex" role="presentation">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-veil-in absolute inset-0 bg-espresso/45 backdrop-blur-[3px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 flex flex-col bg-bg shadow-lg",
          isBottom
            ? "animate-sheet-bottom mt-auto max-h-[88dvh] w-full rounded-t-lg border-t border-line"
            : "animate-sheet-right ml-auto h-full w-full max-w-md border-l border-line",
          // On small screens a right sheet becomes a bottom sheet.
          !isBottom &&
            "max-sm:animate-sheet-bottom max-sm:mt-auto max-sm:h-auto max-sm:max-h-[88dvh] max-sm:rounded-t-lg max-sm:border-t max-sm:border-l-0",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="t-h2">{title}</h2>
            {description ? <p className="t-caption mt-1">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title.toLowerCase()}`}
            className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-sm text-espresso transition-colors duration-fast ease-brand hover:bg-latte-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-4.5 w-4.5">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>

        {footer ? (
          <footer className="border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
