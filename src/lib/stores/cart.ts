"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Fulfilment = "pickup" | "delivery";

export type BeanLine = {
  kind: "bean";
  slug: string;
  name: string;
  sizeId: string;
  sizeLabel: string;
  grind: string;
  grindLabel: string;
  subscription: string | null;
  subscriptionLabel: string | null;
};

export type CafeLine = {
  kind: "cafe";
  itemId: string;
  name: string;
  sizeId: string | null;
  sizeLabel: string | null;
  milk: string | null;
  milkLabel: string | null;
  syrup: string | null;
  syrupLabel: string | null;
  extraShots: number;
};

export type CartLine = (BeanLine | CafeLine) & {
  id: string;
  unitPrice: number;
  quantity: number;
};

/** Omit must distribute, or the union collapses to its shared keys. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** A line as callers supply it: the id and quantity are derived by the store. */
export type NewCartLine = DistributiveOmit<CartLine, "id" | "quantity">;

export type PromoCode = {
  code: string;
  label: string;
  /** Fraction off the subtotal. */
  rate: number;
};

const PROMO_CODES: PromoCode[] = [
  { code: "SECONDCUP", label: "Second cup — 10% off", rate: 0.1 },
  { code: "ARTYOUCANTASTE", label: "Welcome — 15% off", rate: 0.15 },
];

export const DELIVERY_FEE = 3.5;
export const FREE_DELIVERY_THRESHOLD = 30;

type CartState = {
  lines: CartLine[];
  fulfilment: Fulfilment;
  locationId: string | null;
  promo: PromoCode | null;
  drawerOpen: boolean;
  add: (line: NewCartLine, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  setFulfilment: (fulfilment: Fulfilment) => void;
  setLocation: (locationId: string | null) => void;
  applyPromo: (code: string) => { ok: boolean; message: string };
  clearPromo: () => void;
  setDrawerOpen: (open: boolean) => void;
};

/** Identical configurations collapse into one line, so the key is the config. */
function lineKey(line: NewCartLine): string {
  if (line.kind === "bean") {
    return ["bean", line.slug, line.sizeId, line.grind, line.subscription ?? "one-off"].join("|");
  }
  return [
    "cafe",
    line.itemId,
    line.sizeId ?? "-",
    line.milk ?? "-",
    line.syrup ?? "-",
    String(line.extraShots),
  ].join("|");
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      fulfilment: "pickup",
      locationId: null,
      promo: null,
      drawerOpen: false,

      add: (line, quantity = 1) => {
        const id = lineKey(line);
        const existing = get().lines.find((candidate) => candidate.id === id);
        set({
          lines: existing
            ? get().lines.map((candidate) =>
                candidate.id === id
                  ? { ...candidate, quantity: Math.min(candidate.quantity + quantity, 99) }
                  : candidate,
              )
            : [...get().lines, { ...line, id, quantity } as CartLine],
        });
      },

      remove: (id) => set({ lines: get().lines.filter((line) => line.id !== id) }),

      setQuantity: (id, quantity) =>
        set({
          lines:
            quantity <= 0
              ? get().lines.filter((line) => line.id !== id)
              : get().lines.map((line) =>
                  line.id === id ? { ...line, quantity: Math.min(quantity, 99) } : line,
                ),
        }),

      clear: () => set({ lines: [], promo: null }),
      setFulfilment: (fulfilment) => set({ fulfilment }),
      setLocation: (locationId) => set({ locationId }),

      applyPromo: (code) => {
        const normalised = code.trim().toUpperCase();
        if (!normalised) return { ok: false, message: "Enter a code to continue." };
        const match = PROMO_CODES.find((promo) => promo.code === normalised);
        if (!match) return { ok: false, message: `“${normalised}” isn't a code we recognise.` };
        set({ promo: match });
        return { ok: true, message: match.label };
      },

      clearPromo: () => set({ promo: null }),
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
    }),
    {
      name: "shop_demo.cart.v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lines: state.lines,
        fulfilment: state.fulfilment,
        locationId: state.locationId,
        promo: state.promo,
      }),
    },
  ),
);

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  /** Drinks and bags both earn a stamp; this is what the order will award. */
  stampsEarned: number;
  freeDeliveryShortfall: number;
};

export function computeTotals(state: {
  lines: CartLine[];
  fulfilment: Fulfilment;
  promo: PromoCode | null;
}): CartTotals {
  const subtotal = state.lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const itemCount = state.lines.reduce((sum, line) => sum + line.quantity, 0);
  const discount = state.promo ? Math.round(subtotal * state.promo.rate * 100) / 100 : 0;
  const discounted = subtotal - discount;
  const qualifiesFree = discounted >= FREE_DELIVERY_THRESHOLD;
  const delivery =
    state.fulfilment === "delivery" && !qualifiesFree && itemCount > 0 ? DELIVERY_FEE : 0;

  return {
    itemCount,
    subtotal: Math.round(subtotal * 100) / 100,
    discount,
    delivery,
    total: Math.round((discounted + delivery) * 100) / 100,
    stampsEarned: itemCount,
    freeDeliveryShortfall: Math.max(0, Math.round((FREE_DELIVERY_THRESHOLD - discounted) * 100) / 100),
  };
}

export function describeLine(line: CartLine): string[] {
  if (line.kind === "bean") {
    return [
      line.sizeLabel,
      line.grindLabel,
      line.subscriptionLabel ? `Subscription · ${line.subscriptionLabel}` : "One-off",
    ];
  }
  return [
    line.sizeLabel,
    line.milkLabel,
    line.syrup && line.syrup !== "none" ? line.syrupLabel : null,
    line.extraShots > 0 ? `${line.extraShots} extra shot${line.extraShots > 1 ? "s" : ""}` : null,
  ].filter((value): value is string => Boolean(value));
}

export { PROMO_CODES };
