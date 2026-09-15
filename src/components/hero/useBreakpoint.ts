"use client";

import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

function bpFor(width: number): Breakpoint {
  if (width < 768) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  // Match SSR and the first client render to avoid hydration mismatches; refine after mount.
  const [bp, setBp] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const onResize = () => {
      const next = bpFor(window.innerWidth);
      setBp((current) => (current === next ? current : next));
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return bp;
}
