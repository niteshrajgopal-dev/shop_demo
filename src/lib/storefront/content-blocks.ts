import type { StorefrontLocale } from "@/lib/locale/storefront-locale";
import { resolveLocalizedCopy } from "@/lib/storefront/localized-copy";
import type { StorefrontManifestContentBlock } from "@/lib/storefront/manifest-types";
import type { StorefrontThemePresetId } from "@/lib/storefront/theme-presets";

const CONTENT_COPY: Record<StorefrontThemePresetId, Record<string, string>> = {
  hospitality_baseline: {
    "home.hero.title": "Coffee worth slowing down for.",
    "home.hero.subtitle":
      "We roast in small batches, pour it in our cafés, and post it anywhere in the country the next morning.",
  },
  generic_retail_baseline: {
    "home.hero.title": "Fresh flowers for every moment.",
    "home.hero.subtitle": "Seasonal bouquets and stems, ready for pickup or delivery.",
  },
};

export type StorefrontHeroBlock = {
  id: string;
  title: string;
  subtitle: string;
};

function readPropString(props: Record<string, unknown>, key: string) {
  const value = props[key];
  return typeof value === "string" ? value.trim() : "";
}

function resolveCopyKey(presetId: StorefrontThemePresetId, key: string) {
  if (!key) {
    return "";
  }

  return CONTENT_COPY[presetId][key] ?? formatLabelKey(key);
}

function formatLabelKey(labelKey: string) {
  const leaf = labelKey.split(".").pop() ?? labelKey;
  return leaf
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveCopyField(
  props: Record<string, unknown>,
  field: string,
  keyField: string,
  fallbackKey: string,
  presetId: StorefrontThemePresetId,
  locale: StorefrontLocale,
) {
  const localized = resolveLocalizedCopy(
    props[field],
    locale,
    resolveCopyKey(presetId, readPropString(props, keyField) || fallbackKey),
  );

  if (localized) {
    return localized;
  }

  return resolveCopyKey(presetId, readPropString(props, keyField) || fallbackKey);
}

export function resolveVisibleContentBlocks(
  contentBlocks: StorefrontManifestContentBlock[],
) {
  return contentBlocks.filter((block) => block.visible !== false);
}

export function findHeroContentBlock(
  contentBlocks: StorefrontManifestContentBlock[],
): StorefrontManifestContentBlock | undefined {
  return resolveVisibleContentBlocks(contentBlocks).find(
    (block) => block.type === "hero",
  );
}

export function findFooterContentBlock(
  contentBlocks: StorefrontManifestContentBlock[],
): StorefrontManifestContentBlock | undefined {
  return resolveVisibleContentBlocks(contentBlocks).find(
    (block) => block.type === "footer",
  );
}

export function resolveHeroContentBlock(
  presetId: StorefrontThemePresetId,
  contentBlocks: StorefrontManifestContentBlock[],
  locale: StorefrontLocale,
): StorefrontHeroBlock | null {
  const block = findHeroContentBlock(contentBlocks);
  if (!block) {
    return null;
  }

  const title = resolveCopyField(
    block.props,
    "title",
    "titleKey",
    "home.hero.title",
    presetId,
    locale,
  );
  const subtitle = resolveCopyField(
    block.props,
    "subtitle",
    "subtitleKey",
    "home.hero.subtitle",
    presetId,
    locale,
  );

  if (!title && !subtitle) {
    return null;
  }

  return {
    id: block.id,
    title: title || resolveCopyKey(presetId, "home.hero.title"),
    subtitle: subtitle || resolveCopyKey(presetId, "home.hero.subtitle"),
  };
}

export function resolveFooterStatement(
  presetId: StorefrontThemePresetId,
  contentBlocks: StorefrontManifestContentBlock[],
  locale: StorefrontLocale,
  fallback: string,
) {
  const block = findFooterContentBlock(contentBlocks);
  if (!block) {
    return fallback;
  }

  return (
    resolveLocalizedCopy(block.props.statement, locale, fallback) || fallback
  );
}
