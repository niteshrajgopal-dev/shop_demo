import type { StorefrontLocale } from "@/lib/locale/storefront-locale";

export type LocalizedCopy = {
  en: string;
  ar: string;
};

function isLocalizedCopy(value: unknown): value is LocalizedCopy {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as LocalizedCopy).en === "string"
  );
}

export function resolveLocalizedCopy(
  value: unknown,
  locale: StorefrontLocale,
  fallback = "",
): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (!isLocalizedCopy(value)) {
    return fallback;
  }

  const localized = locale === "ar" ? value.ar.trim() : value.en.trim();
  if (localized) {
    return localized;
  }

  const alternate = locale === "ar" ? value.en.trim() : value.ar.trim();
  return alternate || fallback;
}
