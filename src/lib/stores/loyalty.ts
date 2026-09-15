"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** The card is eight stamps, matching the "5 of 8" state in the design export. */
export const STAMPS_PER_CARD = 8;

export type LoyaltyEvent = {
  id: string;
  at: string;
  label: string;
  stamps: number;
  kind: "earned" | "redeemed";
};

export type Reward = {
  id: string;
  name: string;
  detail: string;
  cost: number;
};

export const REWARDS: Reward[] = [
  { id: "free-coffee", name: "Any coffee, free", detail: "Espresso bar or filter, any size.", cost: 1 },
  { id: "bag-discount", name: "£4 off any 250g bag", detail: "Retail beans, in café or online.", cost: 2 },
  { id: "cupping", name: "Seat at a Friday cupping", detail: "Ancoats roastery, two hours.", cost: 3 },
];

type LoyaltyState = {
  member: string | null;
  stamps: number;
  rewardsAvailable: number;
  lifetimeStamps: number;
  history: LoyaltyEvent[];
  join: (name: string) => void;
  leave: () => void;
  addStamps: (count: number, label: string) => { rewardsUnlocked: number };
  redeem: (reward: Reward) => { ok: boolean; message: string };
};

export const useLoyalty = create<LoyaltyState>()(
  persist(
    (set, get) => ({
      member: null,
      stamps: 0,
      rewardsAvailable: 0,
      lifetimeStamps: 0,
      history: [],

      join: (name) => {
        const event: LoyaltyEvent = {
          id: `join-${Date.now()}`,
          at: new Date().toISOString(),
          label: "Joined the bean card",
          stamps: 0,
          kind: "earned",
        };
        set({ member: name.trim(), history: [event, ...get().history] });
      },

      leave: () =>
        set({ member: null, stamps: 0, rewardsAvailable: 0, lifetimeStamps: 0, history: [] }),

      addStamps: (count, label) => {
        if (count <= 0) return { rewardsUnlocked: 0 };
        const total = get().stamps + count;
        const rewardsUnlocked = Math.floor(total / STAMPS_PER_CARD);
        const event: LoyaltyEvent = {
          id: `earn-${Date.now()}`,
          at: new Date().toISOString(),
          label,
          stamps: count,
          kind: "earned",
        };
        set({
          stamps: total % STAMPS_PER_CARD,
          rewardsAvailable: get().rewardsAvailable + rewardsUnlocked,
          lifetimeStamps: get().lifetimeStamps + count,
          history: [event, ...get().history].slice(0, 30),
        });
        return { rewardsUnlocked };
      },

      redeem: (reward) => {
        if (get().rewardsAvailable < reward.cost) {
          const short = reward.cost - get().rewardsAvailable;
          return {
            ok: false,
            message: `${short} more full card${short > 1 ? "s" : ""} needed for that reward.`,
          };
        }
        const event: LoyaltyEvent = {
          id: `redeem-${Date.now()}`,
          at: new Date().toISOString(),
          label: `Redeemed · ${reward.name}`,
          stamps: -reward.cost * STAMPS_PER_CARD,
          kind: "redeemed",
        };
        set({
          rewardsAvailable: get().rewardsAvailable - reward.cost,
          history: [event, ...get().history].slice(0, 30),
        });
        return { ok: true, message: `${reward.name} added to your wallet.` };
      },
    }),
    {
      name: "quotes.loyalty.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
