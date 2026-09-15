/**
 * The coffee catalogue. Ethiopia Yirgacheffe is the product page named in the
 * design export; the rest of the range follows the same data shape so every
 * product surface renders from one source.
 */

export type Roast = "Light" | "Light–Medium" | "Medium" | "Medium–Dark" | "Dark";
export type Process = "Washed" | "Natural" | "Honey" | "Wet-hulled";
import type { PlateTone } from "@/lib/ui/plate-tone";

export type { PlateTone };

export type BagSize = {
  id: string;
  grams: number;
  label: string;
  price: number;
};

export type Coffee = {
  slug: string;
  name: string;
  origin: string;
  region: string;
  producer: string;
  altitude: string;
  varietal: string;
  process: Process;
  roast: Roast;
  overline: string;
  strapline: string;
  story: string;
  notes: string[];
  /** Cupping profile, 1–5, used by the flavour meter on the product page. */
  profile: { acidity: number; body: number; sweetness: number; bitterness: number };
  brewMethods: string[];
  sizes: BagSize[];
  plate: PlateTone;
  featured?: boolean;
  limited?: boolean;
  decaf?: boolean;
  stock: "in-stock" | "low-stock" | "sold-out";
};

export const GRINDS = [
  { id: "whole", label: "Whole bean", hint: "Grind fresh at home" },
  { id: "espresso", label: "Espresso", hint: "Fine · pressurised" },
  { id: "filter", label: "Filter", hint: "Medium · V60, Chemex" },
  { id: "cafetiere", label: "Cafetière", hint: "Coarse · French press" },
  { id: "moka", label: "Moka pot", hint: "Fine–medium · stovetop" },
] as const;

export type GrindId = (typeof GRINDS)[number]["id"];

export const SUBSCRIPTION_FREQUENCIES = [
  { id: "weekly", label: "Every week", discount: 0.15 },
  { id: "fortnightly", label: "Every 2 weeks", discount: 0.12 },
  { id: "monthly", label: "Every month", discount: 0.1 },
] as const;

export type FrequencyId = (typeof SUBSCRIPTION_FREQUENCIES)[number]["id"];

const standardSizes = (base: number): BagSize[] => [
  { id: "250g", grams: 250, label: "250g", price: base },
  { id: "500g", grams: 500, label: "500g", price: Math.round(base * 1.85 * 100) / 100 },
  { id: "1kg", grams: 1000, label: "1kg", price: Math.round(base * 3.4 * 100) / 100 },
];

export const COFFEES: Coffee[] = [
  {
    slug: "ethiopia-yirgacheffe",
    name: "Ethiopia Yirgacheffe",
    origin: "Ethiopia",
    region: "Yirgacheffe, Gedeo Zone",
    producer: "Konga washing station",
    altitude: "1,950–2,150 m",
    varietal: "Heirloom Landrace",
    process: "Washed",
    roast: "Light",
    overline: "Single origin",
    strapline: "Jasmine, bergamot and white peach — tea-like and luminous.",
    story:
      "Cherries are delivered the same day they are picked, floated, then fermented in clean spring water before drying slowly on raised beds. We roast it light enough to keep the florals intact and let the acidity stay bright rather than sharp. It is the cup we hand to anyone who says they do not like black coffee.",
    notes: ["Jasmine", "Bergamot", "White peach", "Honey"],
    profile: { acidity: 5, body: 2, sweetness: 4, bitterness: 1 },
    brewMethods: ["V60", "Chemex", "Batch filter", "Aeropress"],
    sizes: standardSizes(16.5),
    plate: "origin",
    featured: true,
    stock: "in-stock",
  },
  {
    slug: "signature-blend",
    name: "Signature Blend",
    origin: "Brazil · Colombia · Ethiopia",
    region: "Cerrado, Huila, Guji",
    producer: "Three-farm blend, rotating seasonally",
    altitude: "1,100–2,000 m",
    varietal: "Yellow Bourbon, Caturra, Heirloom",
    process: "Natural",
    roast: "Medium–Dark",
    overline: "House blend",
    strapline: "Dark chocolate, hazelnut and brown sugar. Built for milk.",
    story:
      "The cup the café is built on. Brazil for body and cocoa, Colombia for structure, a small share of Ethiopia for lift. It pulls forgivingly on the bar, holds its own under oat milk, and still tastes like something when it goes cold — which is what a signature blend has to do.",
    notes: ["Dark chocolate", "Hazelnut", "Brown sugar"],
    profile: { acidity: 2, body: 5, sweetness: 4, bitterness: 3 },
    brewMethods: ["Espresso", "Moka", "Cafetière", "Batch filter"],
    sizes: standardSizes(14),
    plate: "espresso",
    featured: true,
    stock: "in-stock",
  },
  {
    slug: "kenya-nyeri-aa",
    name: "Kenya Nyeri AA",
    origin: "Kenya",
    region: "Nyeri, Central Highlands",
    producer: "Gichathaini factory",
    altitude: "1,800–1,900 m",
    varietal: "SL28, SL34, Ruiru 11",
    process: "Washed",
    roast: "Light–Medium",
    overline: "Micro lot",
    strapline: "Blackcurrant, pink grapefruit and a dry, wine-like finish.",
    story:
      "Kenyan SL28 at altitude does something no other varietal manages: a blackcurrant sweetness with real acidity behind it. Only fourteen bags of this lot were available, so it stays on the shelf until it is gone rather than being blended away.",
    notes: ["Blackcurrant", "Pink grapefruit", "Cane sugar"],
    profile: { acidity: 5, body: 3, sweetness: 4, bitterness: 2 },
    brewMethods: ["V60", "Aeropress", "Batch filter"],
    sizes: standardSizes(19),
    plate: "connection",
    limited: true,
    stock: "low-stock",
  },
  {
    slug: "colombia-huila",
    name: "Colombia Huila",
    origin: "Colombia",
    region: "Huila, Pitalito",
    producer: "Finca La Esperanza · Nelson Ramírez",
    altitude: "1,650 m",
    varietal: "Caturra, Castillo",
    process: "Washed",
    roast: "Medium",
    overline: "Single origin",
    strapline: "Red apple, caramel and toasted almond. The easy one.",
    story:
      "Nelson has been sending us the same two hectares of Caturra for four harvests. Clean, sweet, endlessly drinkable — the coffee we recommend when someone wants to move on from supermarket beans without giving up on comfort.",
    notes: ["Red apple", "Caramel", "Toasted almond"],
    profile: { acidity: 3, body: 4, sweetness: 5, bitterness: 2 },
    brewMethods: ["Espresso", "V60", "Cafetière"],
    sizes: standardSizes(15),
    plate: "paper",
    featured: true,
    stock: "in-stock",
  },
  {
    slug: "guatemala-antigua-decaf",
    name: "Guatemala Antigua Decaf",
    origin: "Guatemala",
    region: "Antigua Valley",
    producer: "Bella Vista mill · sugarcane EA process",
    altitude: "1,500–1,700 m",
    varietal: "Bourbon, Caturra",
    process: "Washed",
    roast: "Medium",
    overline: "Decaf",
    strapline: "Toffee, orange peel and cocoa nib. Nobody guesses.",
    story:
      "Decaffeinated with sugarcane-derived ethyl acetate in Colombia, which keeps far more of the sweetness than solvent or water-only methods. We serve it as the default after 4pm and the number of people who notice is roughly zero.",
    notes: ["Toffee", "Orange peel", "Cocoa nib"],
    profile: { acidity: 3, body: 4, sweetness: 4, bitterness: 2 },
    brewMethods: ["Espresso", "V60", "Cafetière"],
    sizes: standardSizes(15.5),
    plate: "espresso",
    decaf: true,
    stock: "in-stock",
  },
  {
    slug: "sumatra-mandheling",
    name: "Sumatra Mandheling",
    origin: "Indonesia",
    region: "Lintong, North Sumatra",
    producer: "Smallholder collective, Aceh Tengah",
    altitude: "1,300–1,500 m",
    varietal: "Typica, Ateng",
    process: "Wet-hulled",
    roast: "Dark",
    overline: "Single origin",
    strapline: "Cedar, molasses and pipe tobacco. Heavy and syrupy.",
    story:
      "Wet-hulling gives Sumatra its unmistakable savoury, earthy weight. This is the darkest roast we do and the only one we would call brooding — a late-evening cup, best black, in a heavy cup, with nothing else going on.",
    notes: ["Cedar", "Molasses", "Pipe tobacco"],
    profile: { acidity: 1, body: 5, sweetness: 3, bitterness: 4 },
    brewMethods: ["Espresso", "Moka", "Cafetière"],
    sizes: standardSizes(16),
    plate: "connection",
    stock: "sold-out",
  },
];

export const ROASTS: Roast[] = ["Light", "Light–Medium", "Medium", "Medium–Dark", "Dark"];

export function getCoffee(slug: string): Coffee | undefined {
  return COFFEES.find((coffee) => coffee.slug === slug);
}

export function getFeatured(): Coffee[] {
  return COFFEES.filter((coffee) => coffee.featured);
}

export function priceFor(coffee: Coffee, sizeId: string): number {
  return (coffee.sizes.find((size) => size.id === sizeId) ?? coffee.sizes[0]).price;
}
