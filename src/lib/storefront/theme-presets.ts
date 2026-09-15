import type { IconName } from "@/components/brand/icons";
import type { StorefrontManifestResponse } from "@/lib/storefront/manifest-types";

export type StorefrontThemePresetId =
  | "hospitality_baseline"
  | "generic_retail_baseline";

export type StorefrontShellNavItem = {
  href: string;
  label: string;
  icon: IconName;
  hint?: string;
};

export type StorefrontThemePreset = {
  id: StorefrontThemePresetId;
  dataTheme: string;
  logoSrc: string;
  logoAlt: string;
  headerChip?: string;
  footerStatement: string;
  primaryNav: StorefrontShellNavItem[];
  tabNav: StorefrontShellNavItem[];
};

const hospitalityPreset: StorefrontThemePreset = {
  id: "hospitality_baseline",
  dataTheme: "hospitality",
  logoSrc: "/brand/quotes-logo.png",
  logoAlt: "Storefront home",
  headerChip: "Coffee Co.",
  footerStatement: "Some conversations deserve another coffee.",
  primaryNav: [
    { href: "/", label: "Home", icon: "coffee", hint: "Landing and story" },
    { href: "/menu", label: "Menu", icon: "cup", hint: "Espresso bar, filter, bakery" },
    { href: "/shop", label: "Shop", icon: "bean", hint: "Beans, single origin and blends" },
    { href: "/order", label: "Order", icon: "bag", hint: "Pickup or delivery in a few taps" },
    { href: "/locations", label: "Cafés", icon: "location", hint: "Branches and opening hours" },
    { href: "/loyalty", label: "Bean card", icon: "loyalty", hint: "Your bean card and rewards" },
  ],
  tabNav: [
    { href: "/", label: "Home", icon: "coffee" },
    { href: "/menu", label: "Menu", icon: "cup" },
    { href: "/order", label: "Order", icon: "bag" },
    { href: "/loyalty", label: "Card", icon: "loyalty" },
  ],
};

const retailPreset: StorefrontThemePreset = {
  id: "generic_retail_baseline",
  dataTheme: "retail",
  logoSrc: "/brand/flower-mark.svg",
  logoAlt: "Flower shop home",
  footerStatement: "Fresh stems, arranged with care.",
  primaryNav: [
    { href: "/menu", label: "Shop", icon: "flower", hint: "Seasonal bouquets and stems" },
    { href: "/order", label: "Order", icon: "bag", hint: "Pickup or delivery" },
    { href: "/locations", label: "Locations", icon: "location", hint: "Find a shop" },
  ],
  tabNav: [
    { href: "/", label: "Home", icon: "flower" },
    { href: "/menu", label: "Shop", icon: "bag" },
    { href: "/order", label: "Order", icon: "bag" },
    { href: "/locations", label: "Visit", icon: "location" },
  ],
};

const PRESETS: Record<StorefrontThemePresetId, StorefrontThemePreset> = {
  hospitality_baseline: hospitalityPreset,
  generic_retail_baseline: retailPreset,
};

function readThemePresetId(manifest: StorefrontManifestResponse): StorefrontThemePresetId {
  const preset = manifest.theme?.preset;
  if (preset === "generic_retail_baseline") {
    return "generic_retail_baseline";
  }
  return "hospitality_baseline";
}

export function resolveStorefrontThemePreset(
  manifest: StorefrontManifestResponse,
): StorefrontThemePreset {
  return PRESETS[readThemePresetId(manifest)];
}

export function resolveStorefrontPrimaryNav(
  manifest: StorefrontManifestResponse,
  preset: StorefrontThemePreset,
): StorefrontShellNavItem[] {
  if (manifest.navigation.length < 2) {
    return preset.primaryNav;
  }

  return manifest.navigation.map((item, index) => ({
    href: item.href,
    label: formatNavigationLabel(item.labelKey),
    icon: preset.primaryNav[index]?.icon ?? "bookmark",
    hint: preset.primaryNav.find((entry) => entry.href === item.href)?.hint,
  }));
}

function formatNavigationLabel(labelKey: string) {
  const leaf = labelKey.split(".").pop() ?? labelKey;
  return leaf.charAt(0).toUpperCase() + leaf.slice(1);
}
