"use client";

import { create } from "zustand";

import { signOutCustomer } from "@/lib/auth/customer-auth-client";
import { fetchCurrentCustomer } from "@/lib/qos/customer-client";
import type { CustomerMeResponse } from "@/lib/qos/types";
import { useQosBasket } from "@/lib/stores/qos-basket";

type CustomerSessionStatus = "idle" | "loading" | "ready";

type CustomerSessionState = {
  customer: CustomerMeResponse["customer"] | null;
  status: CustomerSessionStatus;
  refresh: () => Promise<CustomerMeResponse["customer"] | null>;
  clear: () => void;
  signOut: () => Promise<void>;
};

export const useCustomerSession = create<CustomerSessionState>((set, get) => ({
  customer: null,
  status: "idle",

  refresh: async () => {
    set({ status: "loading" });

    try {
      const response = await fetchCurrentCustomer();
      set({ customer: response.customer, status: "ready" });
      return response.customer;
    } catch {
      set({ customer: null, status: "ready" });
      return null;
    }
  },

  clear: () => {
    set({ customer: null, status: "ready" });
  },

  signOut: async () => {
    await signOutCustomer();
    get().clear();
    await useQosBasket.getState().hydrate();
  },
}));

export function selectCustomerSignedIn(state: CustomerSessionState) {
  return Boolean(state.customer?.emailVerified);
}

export function selectCustomerDisplayName(state: CustomerSessionState) {
  return state.customer?.name || state.customer?.email || null;
}
