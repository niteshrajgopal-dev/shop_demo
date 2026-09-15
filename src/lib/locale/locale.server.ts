import { cookies } from "next/headers";

import {
  LOCALE_COOKIE_NAME,
  parseStorefrontLocale,
  type StorefrontLocale,
} from "@/lib/locale/storefront-locale";

export async function getServerStorefrontLocale(): Promise<StorefrontLocale> {
  const cookieStore = await cookies();
  return parseStorefrontLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}
