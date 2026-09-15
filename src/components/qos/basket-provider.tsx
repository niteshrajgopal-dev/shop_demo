"use client";

import { useEffect } from "react";

import { useQosBasket } from "@/lib/stores/qos-basket";
import { useStorefrontLocale } from "@/lib/stores/storefront-locale";

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useQosBasket((state) => state.hydrate);
  const locale = useStorefrontLocale((state) => state.locale);
  const localeHydrated = useStorefrontLocale((state) => state.hydrated);

  useEffect(() => {
    if (!localeHydrated) {
      return;
    }

    void hydrate(locale);
  }, [hydrate, locale, localeHydrated]);

  return children;
}
