export type StorefrontLocale = "en" | "ar";

export const STOREFRONT_LOCALES = ["en", "ar"] as const satisfies readonly StorefrontLocale[];

export const LOCALE_COOKIE_NAME = "shop_demo.locale";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseStorefrontLocale(value: string | null | undefined): StorefrontLocale {
  return value === "ar" ? "ar" : "en";
}

export function localeDirection(locale: StorefrontLocale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function readClientStorefrontLocale(): StorefrontLocale {
  if (typeof document === "undefined") {
    return "en";
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE_NAME.replace(".", "\\.")}=([^;]+)`),
  );

  return parseStorefrontLocale(match ? decodeURIComponent(match[1]) : null);
}

export function writeClientStorefrontLocale(locale: StorefrontLocale) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}
