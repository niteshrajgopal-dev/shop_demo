"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { Mark } from "@/components/brand/mark";

type ToastTone = "default" | "success" | "error";

type Toast = {
  id: number;
  title: string;
  body?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (input: { title: string; body?: string; tone?: ToastTone }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    ({ title, body, tone = "default" }) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current.slice(-2), { id, title, body, tone }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+84px)] z-90 flex flex-col items-center gap-2 px-4 md:bottom-6 md:left-auto md:right-6 md:items-end md:px-0"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "animate-rise-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border px-4 py-3.5 shadow-lg",
              item.tone === "error"
                ? "border-error/50 bg-[color-mix(in_oklab,var(--color-error),var(--color-cream)_86%)] text-[#7a3522]"
                : "border-espresso bg-espresso text-cream",
            )}
          >
            <Mark
              onDark={item.tone !== "error"}
              className={cn("mt-0.5 w-4 shrink-0", item.tone === "error" && "opacity-70")}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{item.title}</p>
              {item.body ? (
                <p
                  className={cn(
                    "mt-0.5 text-[13px] leading-snug",
                    item.tone === "error" ? "opacity-80" : "text-cream/65",
                  )}
                >
                  {item.body}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss"
              className={cn(
                "-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-sm transition-colors duration-fast",
                item.tone === "error" ? "hover:bg-error/10" : "hover:bg-cream/10",
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-3.5 w-3.5">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
