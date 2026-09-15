"use client";

import { useEffect } from "react";

import { useOptionalStorefrontShell } from "@/lib/stores/storefront-shell";

export function StorefrontThemeEffect() {
  const shell = useOptionalStorefrontShell();

  useEffect(() => {
    if (!shell) {
      return;
    }

    if (shell.dataTheme) {
      document.documentElement.dataset.theme = shell.dataTheme;
    }

    const root = document.documentElement;
    const previousValues = new Map<string, string>();

    if (shell.themeCssVariables) {
      for (const [name, value] of Object.entries(shell.themeCssVariables)) {
        previousValues.set(name, root.style.getPropertyValue(name));
        root.style.setProperty(name, value);
      }
    }

    return () => {
      for (const [name, value] of previousValues.entries()) {
        if (value) {
          root.style.setProperty(name, value);
        } else {
          root.style.removeProperty(name);
        }
      }
    };
  }, [shell]);

  return null;
}
