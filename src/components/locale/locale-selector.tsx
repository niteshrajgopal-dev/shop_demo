"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { storefrontMessage } from "@/lib/locale/messages";
import type { StorefrontLocale } from "@/lib/locale/storefront-locale";
import { useStorefrontLocale } from "@/lib/stores/storefront-locale";
import { useHydrated } from "@/lib/use-hydrated";

type LocaleSelectorProps = {
  compact?: boolean;
  className?: string;
};

export function LocaleSelector({ compact = false, className }: LocaleSelectorProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const locale = useStorefrontLocale((state) => state.locale);
  const setLocale = useStorefrontLocale((state) => state.setLocale);

  function choose(nextLocale: StorefrontLocale) {
    if (nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);
    router.refresh();
  }

  if (!hydrated) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label={storefrontMessage(locale, "localeLabel")}
      className={cn(
        "inline-flex rounded-full border border-line bg-surface p-0.5",
        compact ? "text-[11px]" : "text-[12px]",
        className,
      )}
    >
      {(["en", "ar"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={locale === option}
          onClick={() => choose(option)}
          className={cn(
            "min-h-9 rounded-full px-3 font-medium transition-colors duration-fast ease-brand no-tap-highlight",
            locale === option
              ? "bg-espresso text-cream"
              : "text-muted hover:text-fg",
          )}
        >
          {option === "en"
            ? storefrontMessage(locale, "localeEnglish")
            : storefrontMessage(locale, "localeArabic")}
        </button>
      ))}
    </div>
  );
}
