"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { StorefrontShellNavItem } from "@/lib/storefront/theme-presets";

export type StorefrontShellSnapshot = {
  brandName: string;
  hostname: string;
  themePresetId: string;
  dataTheme: string;
  logoSrc: string;
  logoAlt: string;
  headerChip?: string;
  footerStatement: string;
  primaryNav: StorefrontShellNavItem[];
  tabNav: StorefrontShellNavItem[];
  localeSelectorEnabled: boolean;
  supportedLocales: string[];
  defaultLocale: string;
  locations: Array<{
    locationPublicId: string;
    slug: string;
    name: string;
  }>;
  themeCssVariables?: Record<string, string>;
};

const StorefrontShellContext = createContext<StorefrontShellSnapshot | null>(null);

export function StorefrontShellProvider({
  value,
  children,
}: {
  value: StorefrontShellSnapshot;
  children: ReactNode;
}) {
  return (
    <StorefrontShellContext.Provider value={value}>
      {children}
    </StorefrontShellContext.Provider>
  );
}

export function useStorefrontShell() {
  const value = useContext(StorefrontShellContext);
  if (!value) {
    throw new Error("useStorefrontShell must be used within StorefrontShellProvider.");
  }
  return value;
}

export function useOptionalStorefrontShell() {
  return useContext(StorefrontShellContext);
}
