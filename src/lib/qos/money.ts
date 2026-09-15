export function formatAedMinor(amountMinor: number): string {
  return formatMoneyMinor(amountMinor, "AED", "en");
}

export function formatMoneyMinor(
  amountMinor: number,
  currency: string,
  locale: "en" | "ar" = "en",
): string {
  const intlLocale = locale === "ar" ? "ar-AE" : "en-AE";

  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}
