"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

import type { Breakpoint } from "@/components/hero/useBreakpoint";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

type HeroAnimationOptions = {
  rootRef: RefObject<HTMLDivElement | null>;
  bp: Breakpoint;
  ambientIntensity?: number;
  pointerParallax?: boolean;
  foregroundBlur?: boolean;
};

const rng =
  (seed: number) =>
  (): number => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

export function useHeroAnimation({
  rootRef,
  bp,
  ambientIntensity = 1,
  pointerParallax = true,
  foregroundBlur = true,
}: HeroAnimationOptions) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
    const hero = root.querySelector<HTMLElement>("[data-hero]");
    if (!hero) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const intensity = ambientIntensity;
    const parallaxOn = pointerParallax && !touch && !reduce && bp !== "mobile";

    const reveal = (key: string) => root.querySelector<HTMLElement>(`[data-reveal="${key}"]`);

    let onMove: ((event: PointerEvent) => void) | null = null;
    const ctx = gsap.context(() => {
      const bg = root.querySelector<HTMLElement>("[data-bg]");
      const bouquet = root.querySelector<HTMLElement>("[data-bouquet]");
      const petals = q("[data-petal]");
      const sig = root.querySelector<HTMLElement>("[data-sig]");
      const lines = ["l1", "l2", "l3"].map((key) => reveal(key));

      if (!bg || !bouquet || !sig) return;

      if (reduce) {
        const tl = gsap.timeline({ defaults: { ease: "power1.out", duration: 0.6 } });
        tl.to(bg, { opacity: 1 }, 0)
          .to(bouquet, { opacity: 1 }, 0.1)
          .to(q("[data-reveal]"), { opacity: 1, stagger: 0.06 }, 0.2)
          .to(petals, { opacity: (_, el) => +(el as HTMLElement).dataset.o!, stagger: 0.03 }, 0.3)
          .to(sig, { opacity: 0.95 }, 0.4);
        return;
      }

      gsap.set(bouquet, { y: 40, scale: 1.08, rotation: -0.75, transformOrigin: "50% 60%" });
      gsap.set(lines, { yPercent: 110 });
      gsap.set(
        [reveal("eyebrow"), reveal("copy"), reveal("cta"), reveal("caption"), reveal("scroll"), reveal("bottom")],
        { y: 24 },
      );

      const ambient: gsap.core.Timeline[] = [];
      const startAmbient = () => {
        q("[data-drift]").forEach((el) => {
          const zone = el.dataset.drift;
          const rnd = rng(+(el.dataset.seed ?? "0") * 17 + 3);
          const amp = (zone === "bg" ? 26 : zone === "fg" ? 80 : 50) * intensity;
          const sx = rnd() > 0.5 ? 1 : -1;
          const sy = rnd() > 0.3 ? 1 : -1;
          const d = 9 + rnd() * 7;
          const tl = gsap.timeline({
            repeat: -1,
            yoyo: true,
            delay: rnd() * 3,
            defaults: { ease: "sine.inOut" },
          });
          tl.to(el, {
            x: sx * amp * (0.4 + rnd() * 0.4),
            y: sy * amp * (0.5 + rnd() * 0.5),
            rotation: (rnd() * 40 - 20) * intensity,
            duration: d * 0.45,
          }).to(el, {
            x: sx * amp * (0.9 + rnd() * 0.5),
            y: sy * amp * (1.2 + rnd() * 0.8),
            rotation: (rnd() * 70 + 20) * (rnd() > 0.5 ? 1 : -1) * intensity,
            duration: d * 0.55,
          });
          ambient.push(tl);
        });

        const idle = gsap.timeline({ defaults: { ease: "sine.inOut" } });
        idle
          .to(bouquet, { y: -8, x: -2, rotation: -0.4, duration: 2.7 })
          .to(bouquet, { y: 8, x: 3, rotation: 0.45, duration: 5.4, repeat: -1, yoyo: true });
        ambient.push(idle);

        ScrollTrigger.create({
          trigger: hero,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => ambient.forEach((timeline) => (self.isActive ? timeline.resume() : timeline.pause())),
        });
      };

      const nav = reveal("nav");
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(bg, { opacity: 1, duration: 1.6, ease: "power2.out" }, 0)
        .to(nav, { opacity: 1, duration: 1.2 }, 0.1)
        .to(bouquet, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 1.5 }, 0.15)
        .to(reveal("eyebrow"), { opacity: 1, y: 0, duration: 1 }, 0.35)
        .to(lines[0], { opacity: 1, yPercent: 0, duration: 1.2 }, 0.5)
        .to(lines[1], { opacity: 1, yPercent: 0, duration: 1.2 }, 0.63)
        .to(lines[2], { opacity: 1, yPercent: 0, duration: 1.2 }, 0.77)
        .to(reveal("copy"), { opacity: 1, y: 0, duration: 1 }, 0.95)
        .to(reveal("cta"), { opacity: 1, y: 0, duration: 1 }, 1.1)
        .to(reveal("caption"), { opacity: 1, y: 0, duration: 1 }, 1.2)
        .to(reveal("scroll"), { opacity: 1, y: 0, duration: 1 }, 1.3)
        .to(reveal("bottom"), { opacity: 1, y: 0, duration: 1 }, 1.3)
        .to(
          petals,
          {
            opacity: (_, el) => +(el as HTMLElement).dataset.o!,
            duration: 1.6,
            ease: "power2.out",
            stagger: { each: 0.07, from: "random" },
          },
          1.0,
        )
        .to(sig, { opacity: 0.95, duration: 1.4 }, 1.3)
        .add(startAmbient, 1.4);

      if (parallaxOn) {
        const f = bp === "tablet" ? 0.75 : 1;
        const layers = q("[data-mouse]").map((el) => {
          const zone = el.dataset.mouse;
          const depth = zone === "bouquet" ? 9 : +(el.dataset.depth ?? 12);
          const dir = zone === "bg" ? -1 : 1;
          return {
            xTo: gsap.quickTo(el, "x", { duration: 1.1, ease: "power2.out" }),
            yTo: gsap.quickTo(el, "y", { duration: 1.1, ease: "power2.out" }),
            depth: depth * f,
            dir,
            ry: zone === "bouquet" ? 0.7 : 0.85,
          };
        });
        const bgTo = {
          xTo: gsap.quickTo(bg, "x", { duration: 1.4, ease: "power2.out" }),
          yTo: gsap.quickTo(bg, "y", { duration: 1.4, ease: "power2.out" }),
        };

        onMove = (event: PointerEvent) => {
          const nx = (event.clientX / window.innerWidth - 0.5) * 2;
          const ny = (event.clientY / window.innerHeight - 0.5) * 2;
          layers.forEach((layer) => {
            layer.xTo(nx * layer.depth * layer.dir);
            layer.yTo(ny * layer.depth * layer.ry * layer.dir);
          });
          bgTo.xTo(-nx * 3 * f);
          bgTo.yTo(-ny * 2 * f);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
      }

      const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
      const bgScroll = root.querySelector<HTMLElement>("[data-bg] > div");
      if (bgScroll) {
        gsap.to(bgScroll, { yPercent: -6, ease: "none", scrollTrigger: scrub });
      }

      const bouquetScroll = root.querySelector<HTMLElement>('[data-scroll="bouquet"]');
      if (bouquetScroll) {
        gsap.to(bouquetScroll, { y: -90, scale: 1.035, ease: "none", scrollTrigger: scrub });
      }

      gsap.to(q('[data-scroll="bg"]'), { y: -45, ease: "none", scrollTrigger: scrub });
      gsap.to(q('[data-scroll="mid"]'), { y: -150, ease: "none", scrollTrigger: scrub });
      gsap.to(q('[data-scroll="fg"]'), { y: -240, ease: "none", scrollTrigger: scrub });
      gsap.to(
        [root.querySelector("[data-text]"), reveal("caption"), reveal("bottom"), reveal("scroll")],
        { y: -36, opacity: 0.45, ease: "none", scrollTrigger: scrub },
      );

      const H = hero.offsetHeight;
      const span = H * 1.15;
      gsap.to(sig, {
        motionPath: {
          path: [
            { x: 0, y: 0 },
            { x: -150, y: span * 0.3 },
            { x: 110, y: span * 0.65 },
            { x: -40, y: span },
          ],
          curviness: 1.6,
        },
        rotation: 230,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: () => `+=${span}`,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });
    }, root);

    return () => {
      if (onMove) window.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, [rootRef, bp, ambientIntensity, pointerParallax, foregroundBlur]);
}
