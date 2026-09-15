/**
 * Brand copy and constants.
 *
 * Identity copy — names, essence, statements, principles, personality and
 * values — is taken from the design export (brand-spec.md, foundations.html,
 * index.html and the branding guide artwork) rather than invented filler.
 * Trading detail the export does not carry (cafés, prices, catalogue) is
 * defined in the domain modules as the functional data the handoff asks for
 * in place of static placeholders.
 */

export const BRAND = {
  name: "quotes",
  legalName: "quotes coffee co.",
  /** Values triad, from the foundations cover chips. */
  tagline: "Quality · Warmth · Authenticity",
  /** Short header chip, from the round logo variation in the branding guide. */
  chip: "Coffee Co.",
  description:
    "A premium coffee brand built on quality, warmth and memorable moments.",
  essence:
    "Quotes is a premium coffee brand built on quality, warmth and memorable moments. Every detail — from our beans to our brand — is crafted to inspire connection and comfort.",
  statements: {
    hero: "Great coffee creates moments worth remembering.",
    footer: "Some conversations deserve another coffee.",
    together: "Best enjoyed together.",
    ritual: "a pause · a ritual · a conversation · a thought · a moment worth sharing",
  },
  currency: { code: "GBP", symbol: "£" },
} as const;

/** Brand personality, from the branding guide artwork. */
export const PERSONALITY = [
  "Warm",
  "Authentic",
  "Natural",
  "Connection",
  "Quality",
] as const;

/** Values chips, from the foundations cover. */
export const VALUES = [
  "Quality",
  "Warmth",
  "Authenticity",
  "Connection",
  "Craft",
  "Simplicity",
] as const;

/** The six brand principles, verbatim from the foundations Brand section. */
export const PRINCIPLES = [
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

export const SOCIALS = [
  { label: "Instagram", handle: "@quotes.coffee", href: "https://instagram.com/" },
  { label: "TikTok", handle: "@quotes.coffee", href: "https://tiktok.com/" },
  { label: "WhatsApp", handle: "Message us", href: "https://wa.me/" },
  { label: "Phone", handle: "Call the café", href: "tel:+441610000000" },
] as const;

export function formatPrice(amount: number): string {
  return `${BRAND.currency.symbol}${amount.toFixed(2)}`;
}
