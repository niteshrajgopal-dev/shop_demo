"use client";

import { useEffect } from "react";

import { localeDirection } from "@/lib/locale/storefront-locale";
import { useStorefrontLocale } from "@/lib/stores/storefront-locale";

export function StorefrontLocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useStorefrontLocale((state) => state.locale);
  const hydrate = useStorefrontLocale((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDirection(locale);
  }, [locale]);

  return children;
}
