"use client";

import { useSyncExternalStore } from "react";

/** Persisted stores never change identity, so nothing has to be subscribed to. */
const subscribe = () => () => {};

/**
 * Persisted stores read from localStorage after mount, so anything rendering
 * their values must wait for hydration to avoid a server/client mismatch.
 * Returns false during SSR and the first client render, true afterwards.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
