import type { StorefrontThemePresetId } from "@/lib/storefront/theme-presets";

export const HOSPITALITY_HOME_PRINCIPLES = [
  {
    name: "Warm",
    copy: "Inviting, comfortable and human. Never sterile or corporate.",
  },
  {
    name: "Authentic",
    copy: "Natural materials, genuine photography, honest messaging. No artificial luxury.",
  },
  {
    name: "Crafted",
    copy: "Spacing, type, packaging and interaction all feel deliberate.",
  },
  {
    name: "Calm",
    copy: "Never visually noisy. Whitespace is used generously.",
  },
  {
    name: "Premium",
    copy: "Refined type, strong composition, restraint. Never excess decoration.",
  },
  {
    name: "Conversational",
    copy: "Encourages people to stay, talk, work and share time together.",
  },
] as const;

export const HOSPITALITY_HOME_STATEMENTS = {
  hero: "Great coffee creates moments worth remembering.",
  footer: "Some conversations deserve another coffee.",
  ritual: "a pause · a ritual · a conversation · a thought · a moment worth sharing",
} as const;

export function isHospitalityTheme(presetId: StorefrontThemePresetId) {
  return presetId === "hospitality_baseline";
}
