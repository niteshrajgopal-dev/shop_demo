import type { StorefrontLocale } from "@/lib/locale/storefront-locale";

const MESSAGES = {
  en: {
    localeLabel: "Language",
    localeEnglish: "English",
    localeArabic: "Arabic",
    signIn: "Sign in",
    signOut: "Sign out",
    bag: "Bag",
    checkout: "Checkout",
    mergeTitle: "Choose a basket",
    mergeDescription:
      "You have items in both your current browser basket and your saved account basket.",
    mergeReview: "Review merge",
    mergeUseCurrent: "Use current basket",
    mergeKeepSaved: "Keep saved basket",
    mergeCancel: "Cancel",
    mergeConfirm: "Confirm merged basket",
    mergeReplaceSaved: "Replace saved basket",
    mergeDiscardCurrent: "Discard current basket",
    currentBasket: "Current browser basket",
    savedBasket: "Saved account basket",
    proposedMerge: "Proposed merged basket",
    emptyBasket: "Empty basket",
    subtotal: "Subtotal",
    items: "items",
    item: "item",
  },
  ar: {
    localeLabel: "اللغة",
    localeEnglish: "English",
    localeArabic: "العربية",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    bag: "السلة",
    checkout: "الدفع",
    mergeTitle: "اختر السلة",
    mergeDescription: "لديك عناصر في سلة المتصفح الحالية وسلة حسابك المحفوظة.",
    mergeReview: "مراجعة الدمج",
    mergeUseCurrent: "استخدام السلة الحالية",
    mergeKeepSaved: "الاحتفاظ بالسلة المحفوظة",
    mergeCancel: "إلغاء",
    mergeConfirm: "تأكيد السلة المدمجة",
    mergeReplaceSaved: "استبدال السلة المحفوظة",
    mergeDiscardCurrent: "تجاهل السلة الحالية",
    currentBasket: "سلة المتصفح الحالية",
    savedBasket: "سلة الحساب المحفوظة",
    proposedMerge: "السلة المدمجة المقترحة",
    emptyBasket: "سلة فارغة",
    subtotal: "المجموع الفرعي",
    items: "عناصر",
    item: "عنصر",
  },
} as const;

export type StorefrontMessageKey = keyof (typeof MESSAGES)["en"];

export function storefrontMessage(locale: StorefrontLocale, key: StorefrontMessageKey) {
  return MESSAGES[locale][key];
}
