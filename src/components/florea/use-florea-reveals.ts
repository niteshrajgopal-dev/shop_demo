"use client";

import { useEffect, type RefObject } from "react";

export function useFloreaReveals(rootRef: RefObject<HTMLElement | null>, reducedMotion: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const elements = root.querySelectorAll<HTMLElement>("[data-reveal]");
    elements.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(22px)";
      element.style.transition = "opacity 0.9s cubic-bezier(.2,.7,.2,1), transform 0.9s cubic-bezier(.2,.7,.2,1)";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.style.opacity = "1";
          target.style.transform = "none";
          observer.unobserve(target);
        });
      },
      { threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [rootRef, reducedMotion]);
}
