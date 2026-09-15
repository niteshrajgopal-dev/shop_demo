"use client";

import { create } from "zustand";

import { QosRequestError } from "@/lib/qos/api-client";
import { useStorefrontLocale } from "@/lib/stores/storefront-locale";
import {
  ensureActiveBasket,
  fetchCurrentCustomerSignedIn,
  removeAccountBasketLine,
  removeAnonymousBasketLine,
  upsertAccountBasketLine,
  upsertAnonymousBasketLine,
  updateAnonymousBasketLine,
} from "@/lib/qos/basket-client";
import type { BasketContextResponse } from "@/lib/qos/types";

type BasketStatus = "idle" | "loading" | "ready" | "mutating" | "error";

type QosBasketState = {
  basket: BasketContextResponse | null;
  signedIn: boolean;
  status: BasketStatus;
  error: string | null;
  productLabels: Record<string, string>;
  hydrate: (locale?: "en" | "ar") => Promise<void>;
  upsertProduct: (input: {
    productPublicId: string;
    displayName: string;
    quantity?: number;
  }) => Promise<void>;
  setLineQuantity: (linePublicId: string, quantity: number) => Promise<void>;
  removeLine: (linePublicId: string) => Promise<void>;
  rememberProductLabel: (productPublicId: string, displayName: string) => void;
  clearError: () => void;
};

function applyBasket(
  set: (partial: Partial<QosBasketState>) => void,
  basket: BasketContextResponse,
  signedIn: boolean,
) {
  set({
    basket,
    signedIn,
    status: "ready",
    error: null,
  });
}

async function mutateBasket(
  get: () => QosBasketState,
  set: (partial: Partial<QosBasketState>) => void,
  mutation: () => Promise<BasketContextResponse>,
) {
  set({ status: "mutating", error: null });

  try {
    const basket = await mutation();
    applyBasket(set, basket, get().signedIn);
  } catch (error) {
    if (error instanceof QosRequestError && error.statusCode === 409) {
      await get().hydrate();
      set({
        status: "error",
        error: "Basket changed elsewhere. Review the updated bag and try again.",
      });
      return;
    }

    set({
      status: get().basket ? "ready" : "error",
      error: error instanceof Error ? error.message : "Basket update failed.",
    });
  }
}

export const useQosBasket = create<QosBasketState>((set, get) => ({
  basket: null,
  signedIn: false,
  status: "idle",
  error: null,
  productLabels: {},

  hydrate: async (locale) => {
    set({ status: "loading", error: null });

    const activeLocale = locale ?? useStorefrontLocale.getState().locale ?? "en";

    try {
      const signedIn = await fetchCurrentCustomerSignedIn();
      const result = await ensureActiveBasket(activeLocale);
      applyBasket(set, result.basket, signedIn);
    } catch (error) {
      set({
        basket: null,
        signedIn: false,
        status: "error",
        error: error instanceof Error ? error.message : "Unable to load basket.",
      });
    }
  },

  rememberProductLabel: (productPublicId, displayName) => {
    set({
      productLabels: {
        ...get().productLabels,
        [productPublicId]: displayName,
      },
    });
  },

  upsertProduct: async ({ productPublicId, displayName, quantity = 1 }) => {
    get().rememberProductLabel(productPublicId, displayName);

    let basket = get().basket;
    if (!basket) {
      await get().hydrate();
      basket = get().basket;
    }
    if (!basket) {
      return;
    }

    const existingLine = basket.lines.find((line) => line.productPublicId === productPublicId);
    const nextQuantity = existingLine ? existingLine.quantity + quantity : quantity;

    await mutateBasket(get, set, async () => {
      const signedIn = get().signedIn;
      const current = get().basket!;
      const mutationId = crypto.randomUUID();

      if (signedIn) {
        const response = await upsertAccountBasketLine({
          productPublicId,
          quantity: nextQuantity,
          expectedVersion: current.version,
          mutationId,
        });
        return response.basket;
      }

      const response = await upsertAnonymousBasketLine({
        productPublicId,
        quantity: nextQuantity,
        expectedVersion: current.version,
        mutationId,
      });
      return response.basket;
    });
  },

  setLineQuantity: async (linePublicId, quantity) => {
    const basket = get().basket;
    if (!basket) {
      return;
    }

    await mutateBasket(get, set, async () => {
      const signedIn = get().signedIn;
      const current = get().basket!;
      const mutationId = crypto.randomUUID();

      if (signedIn) {
        const response = await upsertAccountBasketLine({
          productPublicId:
            current.lines.find((line) => line.linePublicId === linePublicId)?.productPublicId ??
            "",
          quantity,
          expectedVersion: current.version,
          mutationId,
        });
        return response.basket;
      }

      const response = await updateAnonymousBasketLine(linePublicId, {
        quantity,
        expectedVersion: current.version,
        mutationId,
      });
      return response.basket;
    });
  },

  removeLine: async (linePublicId) => {
    const basket = get().basket;
    if (!basket) {
      return;
    }

    await mutateBasket(get, set, async () => {
      const signedIn = get().signedIn;
      const current = get().basket!;
      const mutationId = crypto.randomUUID();

      if (signedIn) {
        const response = await removeAccountBasketLine(linePublicId, {
          expectedVersion: current.version,
          mutationId,
        });
        return response.basket;
      }

      const response = await removeAnonymousBasketLine(linePublicId, {
        expectedVersion: current.version,
        mutationId,
      });
      return response.basket;
    });
  },

  clearError: () => set({ error: null }),
}));

export function selectBasketItemCount(state: QosBasketState) {
  return state.basket?.itemCount ?? 0;
}
