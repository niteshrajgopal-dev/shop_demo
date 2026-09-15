"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const E = {
  out2: "power2.out",
  out3: "power3.out",
  io4: "power4.inOut",
  expo: "expo.out",
} as const;

export function useHospitalityLandingMotion(
  rootRef: RefObject<HTMLElement | null>,
  options: { showLoader?: boolean } = {},
) {
  const { showLoader = true } = options;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const q = (selector: string) => root.querySelector(selector);
      const qa = (selector: string) => Array.from(root.querySelectorAll(selector));

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 900px)",
          isMobile: "(max-width: 899px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isMobile, reduceMotion } = context.conditions as {
            isMobile: boolean;
            reduceMotion: boolean;
          };
          const K = reduceMotion ? 0.25 : isMobile ? 0.55 : 1;
          const pinLen = (v: number) => (reduceMotion ? v * 0.5 : isMobile ? v * 0.7 : v);

          const loader = q("[data-loader]");
          const intro = gsap.timeline({ defaults: { ease: E.out3 } });

          if (loader && showLoader) {
            intro
              .to("[data-loader-bean]", { opacity: 1, scale: 1, rotate: 0, duration: 0.55 })
              .to(
                "[data-loader-word]",
                { yPercent: -110, y: 0, duration: 0.55, ease: E.expo },
                "-=0.2",
              )
              .to(
                loader,
                {
                  yPercent: -100,
                  duration: 0.7,
                  ease: E.io4,
                  onComplete: () => {
                    (loader as HTMLElement).style.display = "none";
                  },
                },
                "+=0.2",
              );
            setTimeout(() => {
              if (intro.progress() < 1) intro.progress(1);
            }, 3500);
          }

          intro
            .from(
              "[data-hero-word]",
              { yPercent: 110, duration: 0.9, stagger: 0.1, ease: E.expo },
              loader && showLoader ? "-=0.45" : 0,
            )
            .from(
              ["[data-hero-kicker]", "[data-hero-sub]", "[data-hero-ctas]"],
              { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 },
              "-=0.6",
            )
            .from(
              '[data-hero-cup="b"]',
              { y: 80 * K + 20, scale: 0.92, opacity: 0, duration: 1.1, ease: E.expo },
              "-=0.9",
            )
            .from("[data-hero-bean]", { y: 40, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.7");

          gsap
            .timeline({
              scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
            })
            .to("[data-hero-copy]", { y: -90 * K, ease: "none" }, 0)
            .to(
              '[data-hero-cup="b"]',
              { y: -320 * K, scale: 1 - 0.12 * K, ease: "none" },
              0,
            )
            .to('[data-hero-bean="1"]', { y: -480 * K, rotate: 90, ease: "none" }, 0)
            .to('[data-hero-bean="2"]', { y: -240 * K, rotate: -100, ease: "none" }, 0)
            .to("[data-hero-halo]", { scale: 1.4, opacity: 0, ease: "none" }, 0);

          gsap
            .timeline({
              scrollTrigger: {
                trigger: "[data-curated]",
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            })
            .fromTo("[data-curated-marquee]", { xPercent: 4 }, { xPercent: -34 * K, ease: "none" }, 0);

          gsap
            .timeline({
              scrollTrigger: {
                trigger: "[data-curated-grid]",
                start: "top bottom",
                end: "top 25%",
                scrub: true,
              },
            })
            .fromTo(
              "[data-curated-cup]",
              { y: -140 * K, scale: 1.08 },
              { y: 0, scale: 1, ease: "none", stagger: 0.06 },
              0,
            )
            .fromTo(
              "[data-curated-card]",
              { y: 60 * K, opacity: 0.4 },
              { y: 0, opacity: 1, ease: "none", stagger: 0.06 },
              0,
            );

          gsap.from("[data-curated-cta]", {
            y: 20,
            opacity: 0,
            duration: 0.7,
            ease: E.out3,
            scrollTrigger: { trigger: "[data-curated-cta]", start: "top 92%" },
          });

          const stmts = qa("[data-drinks-stmt]");
          const cupW = q("[data-drinks-cupwrap]");
          if (cupW) gsap.set(cupW, { yPercent: -50 });

          const dt = gsap.timeline({
            scrollTrigger: {
              trigger: "[data-drinks]",
              start: "top top",
              end: () => `+=${pinLen(window.innerHeight * 3.0)}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
            },
          });

          if (cupW) {
            dt.fromTo(
              cupW,
              { y: () => window.innerHeight * 0.9, scale: 0.7 },
              { y: 0, scale: 1, duration: 1, ease: E.out3 },
              0,
            )
              .from("[data-drinks-title]", { y: 40 * K, opacity: 0, duration: 0.6, ease: E.out3 }, 0.4)
              .to(cupW, { scale: 1.35, duration: 1.2, ease: "power1.inOut" }, 1);

            stmts.forEach((_, index) => {
              const t = 1 + index * 0.3;
              dt.to(stmts[index], { opacity: 1, y: 0, duration: 0.5, ease: E.out3 }, t).from(
                stmts[index],
                { y: 40 * K, duration: 0.5, ease: E.out3 },
                t,
              );
            });

            dt.to("[data-drinks-sleeve]", { backgroundColor: "#2F2322", duration: 1, ease: E.io4 }, 1.4)
              .to(
                cupW,
                {
                  scale: 0.82,
                  yPercent: -150,
                  y: () => -window.innerHeight * 0.12,
                  duration: 0.9,
                  ease: "power2.inOut",
                },
                2.2,
              )
              .to(stmts, { y: -140 * K, opacity: 0.35, duration: 0.9, ease: "power2.inOut" }, 2.2)
              .to("[data-drinks-title]", { y: -80 * K, opacity: 0, duration: 0.5 }, 2.2)
              .to("[data-drinks-cta]", { opacity: 1, duration: 0.4 }, 2.05)
              .from("[data-drinks-cta]", { y: 30, duration: 0.5, ease: E.out3 }, 2.05)
              .to(
                "[data-drinks-bean]",
                { opacity: 1, y: -320 * K, rotate: "+=60", duration: 1.0, stagger: 0.1, ease: "none" },
                2.1,
              )
              .to({}, { duration: 0.2 });
          }

          gsap
            .timeline({
              scrollTrigger: { trigger: "[data-band]", start: "top bottom", end: "top 30%", scrub: true },
            })
            .fromTo("[data-band-panel]", { y: 120 * K }, { y: 0, ease: "none" }, 0)
            .fromTo(
              '[data-band-bean="1"]',
              { y: 420 * K, rotate: 40 },
              { y: 0, rotate: -20, ease: "none" },
              0,
            )
            .fromTo(
              '[data-band-bean="2"]',
              { y: 300 * K, rotate: -20 },
              { y: 0, rotate: 40, ease: "none" },
              0,
            )
            .fromTo('[data-band-bean="3"]', { y: 520 * K }, { y: 0, ease: "none" }, 0)
            .fromTo('[data-band-bean="4"]', { y: 240 * K }, { y: 0, ease: "none" }, 0)
            .fromTo("[data-band-heap]", { y: 80 * K, scale: 0.9 }, { y: 0, scale: 1, ease: "none" }, 0);

          gsap
            .timeline({
              scrollTrigger: {
                trigger: "[data-statement]",
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            })
            .fromTo(
              '[data-statement-line="1"]',
              { x: 120 * K },
              { x: -220 * K, ease: "none" },
              0,
            )
            .fromTo(
              '[data-statement-line="2"]',
              { x: -160 * K },
              { x: 160 * K, ease: "none" },
              0,
            )
            .fromTo(
              "[data-statement-cup]",
              { y: 220 * K, rotate: 8 * K },
              { y: -380 * K, rotate: -6 * K, ease: "none" },
              0,
            );

          gsap.from("[data-statement-copy]", {
            y: 30,
            opacity: 0,
            duration: 0.9,
            ease: E.out3,
            scrollTrigger: { trigger: "[data-statement-copy]", start: "top 85%" },
          });

          qa("[data-reveal-line]").forEach((line) => {
            const word = line.querySelector("[data-reveal-word]");
            if (word) {
              gsap.from(word, {
                yPercent: 110,
                duration: 1,
                ease: E.expo,
                scrollTrigger: { trigger: line, start: "top 88%" },
              });
            }
          });

          gsap.from("[data-origin-step]", {
            y: 28,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: E.out3,
            scrollTrigger: { trigger: "[data-origins-steps]", start: "top 85%" },
          });

          (
            [
              ["1", -60],
              ["2", -180],
              ["3", -110],
            ] as const
          ).forEach(([n, d]) =>
            gsap.to(`[data-origin-img="${n}"]`, {
              y: d * K,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-origins]",
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }),
          );

          qa("[data-origin-img]").forEach((el) =>
            gsap.from(el, {
              clipPath: "inset(0 0 100% 0)",
              duration: 1.2,
              ease: E.io4,
              scrollTrigger: { trigger: el, start: "top 90%" },
            }),
          );

          gsap.from("[data-menu-row]", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: E.out3,
            scrollTrigger: { trigger: "[data-menu-list]", start: "top 80%" },
          });

          const ft = qa("[data-feature-title]");
          const fc = qa("[data-feature-copy]");
          const ings = qa("[data-feature-ing]");
          gsap.set(ft.slice(1), { yPercent: 110 });
          gsap.set(fc.slice(1), { opacity: 0, y: 16 });

          const f = gsap.timeline({
            scrollTrigger: {
              trigger: "[data-feature]",
              start: "top top",
              end: () => `+=${pinLen(window.innerHeight * 2.6)}`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
            },
          });

          f.from("[data-feature-cup]", { y: 200 * K, scale: 0.85, ease: E.out3, duration: 1 }, 0)
            .from(ft[0], { yPercent: 110, duration: 0.7, ease: E.expo }, 0)
            .from([fc[0], "[data-feature-cta]"], { opacity: 0, y: 20, duration: 0.6 }, 0.3)
            .to("[data-feature-halo]", { opacity: 1, scale: 1, duration: 1, ease: E.io4 }, 1)
            .to(ings, { opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: E.out3 }, 1)
            .from(ings, { x: 40 * K, duration: 0.5, stagger: 0.12, ease: E.out3 }, 1)
            .to("[data-feature-bean]", { opacity: 1, duration: 0.4, stagger: 0.1 }, 1)
            .from("[data-feature-bean]", { y: 60 * K, duration: 0.8, stagger: 0.1, ease: E.out3 }, 1)
            .to(ft[0], { yPercent: -110, duration: 0.6, ease: E.io4 }, 1)
            .to(ft[1], { yPercent: 0, duration: 0.6, ease: E.io4 }, 1)
            .to(fc[0], { opacity: 0, y: -16, duration: 0.4 }, 1)
            .to(fc[1], { opacity: 1, y: 0, duration: 0.5 }, 1.15)
            .to("[data-feature-cup]", { rotate: 4 * K, y: -20 * K, duration: 0.8, ease: E.io4 }, 1)
            .to("[data-feature-bg]", { backgroundColor: "#CBB792", duration: 1, ease: E.io4 }, 2)
            .to("[data-feature-halo]", { opacity: 0, duration: 0.6 }, 2)
            .to(ft[1], { yPercent: -110, duration: 0.6, ease: E.io4 }, 2)
            .to(ft[2], { yPercent: 0, duration: 0.6, ease: E.io4 }, 2)
            .to(fc[1], { opacity: 0, y: -16, duration: 0.4 }, 2)
            .to(fc[2], { opacity: 1, y: 0, duration: 0.5 }, 2.15)
            .to("[data-feature-detail]", { opacity: 1, y: 0, color: "#2F2322", duration: 0.6 }, 2.2)
            .from("[data-feature-detail]", { y: 20, duration: 0.6 }, 2.2)
            .to("[data-feature-cup]", { rotate: 0, y: 0, scale: 1.06, duration: 0.8, ease: E.io4 }, 2)
            .to(
              "[data-feature-bean]",
              { y: -80 * K, rotate: "+=40", duration: 1, ease: "none" },
              2,
            )
            .to({}, { duration: 0.5 });

          gsap.from("[data-loc-card]", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: E.out3,
            scrollTrigger: { trigger: "[data-loc-grid]", start: "top 85%" },
          });

          gsap.from("[data-rewards-panel]", {
            y: 50,
            opacity: 0,
            duration: 0.9,
            ease: E.out3,
            scrollTrigger: { trigger: "[data-rewards-panel]", start: "top 88%" },
          });

          gsap.from("[data-footer-word]", {
            x: -80 * K,
            opacity: 0,
            duration: 1.2,
            ease: E.io4,
            scrollTrigger: { trigger: "[data-footer-word]", start: "top 95%" },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [showLoader] },
  );
}
