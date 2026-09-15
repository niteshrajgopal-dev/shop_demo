import type { IconName } from "@/components/brand/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  /** Shown in the mobile drawer only. */
  hint?: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { href: "/shop", label: "Coffee", icon: "bean", hint: "Beans, single origin and blends" },
  { href: "/menu", label: "Café menu", icon: "coffee", hint: "Espresso bar, filter, bakery" },
  { href: "/order", label: "Order", icon: "cup", hint: "Pickup or delivery in a few taps" },
  { href: "/loyalty", label: "Loyalty", icon: "loyalty", hint: "Your bean card and rewards" },
  { href: "/journal", label: "Journal", icon: "bookmark", hint: "Origins, people and conversations" },
  { href: "/locations", label: "Locations", icon: "location", hint: "Three cafés, opening hours" },
];

/** Mobile tab bar: the four surfaces people reach for on a phone. */
export const TAB_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: "coffee" },
  { href: "/menu", label: "Menu", icon: "cup" },
  { href: "/order", label: "Order", icon: "bag" },
  { href: "/loyalty", label: "Card", icon: "loyalty" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/design-system", label: "Design system", icon: "bookmark" },
];
