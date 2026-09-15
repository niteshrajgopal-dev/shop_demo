"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { heroLayout } from "@/components/hero/layout";
import { petalDefs, type PetalDef } from "@/components/hero/petals";
import { useBreakpoint } from "@/components/hero/useBreakpoint";
import { useHeroAnimation } from "@/components/hero/useHeroAnimation";
import { useCart } from "@/lib/stores/cart";
import { useQosBasket, selectBasketItemCount } from "@/lib/stores/qos-basket";
import { useHydrated } from "@/lib/use-hydrated";

const zoneZ = { bg: 1, mid: 4, fg: 6 } as const;

function filterPetals(bp: ReturnType<typeof useBreakpoint>, defs: PetalDef[]) {
  if (bp === "desktop") return defs;
  if (bp === "tablet") return defs.filter((petal) => petal.t !== false);
  return defs.filter((petal) => petal.m === true);
}

function petalStyles(petal: PetalDef, bp: ReturnType<typeof useBreakpoint>, foregroundBlur: boolean) {
  const blur =
    petal.zone === "fg"
      ? foregroundBlur
        ? bp === "mobile"
          ? 2
          : petal.blur
        : 0
      : petal.blur;

  const width = Math.round(petal.w * petal.s);
  const height = Math.round(petal.h * petal.s);

  const filter =
    petal.zone === "mid"
      ? "drop-shadow(0 10px 12px rgba(80,40,40,.15))"
      : blur
        ? `blur(${blur}px)`
        : "none";

  return {
    wrapStyle: {
      position: "absolute" as const,
      zIndex: zoneZ[petal.zone],
      left: `${petal.left}%`,
      top: `${petal.top}%`,
      opacity: 0,
      pointerEvents: "none" as const,
      willChange: "transform" as const,
    },
    imgStyle: {
      width,
      height,
      transform: `rotate(${petal.rot}deg)`,
      filter,
    },
  };
}

export function Hero({ brandName }: { brandName: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const L = heroLayout(bp);
  const hydrated = useHydrated();
  const itemCount = useQosBasket(selectBasketItemCount);
  const setDrawerOpen = useCart((state) => state.setDrawerOpen);
  const [ctaHover, setCtaHover] = useState(false);

  useHeroAnimation({ rootRef, bp });

  const petals = useMemo(() => {
    return filterPetals(bp, petalDefs()).map((petal, index) => ({
      ...petal,
      seed: index + 1,
      ...petalStyles(petal, bp, true),
    }));
  }, [bp]);

  const onCtaClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById("collections");
    if (target) {
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative overflow-x-clip font-[family-name:var(--font-manrope)] text-[#1c1a1a]"
    >
      <section
        data-hero="1"
        className="relative isolate h-svh min-h-[700px] overflow-clip"
      >
        <div
          data-bg="1"
          aria-hidden="true"
          className="absolute top-[-12%] right-0 left-0 z-0 h-[124%] opacity-0 will-change-transform"
          style={{
            background:
              "linear-gradient(180deg,#e6ecf3 0%,#f1efeb 30%,#ece4dd 46%,#cfcbcb 60%,#a9a8ab 76%,#8f9096 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 45% at 18% 18%,rgba(255,247,236,.95),rgba(255,247,236,0) 70%),radial-gradient(ellipse 50% 40% at 78% 30%,rgba(255,255,255,.7),rgba(255,255,255,0) 70%)",
            }}
          />
          <div
            className="absolute top-[52%] right-0 left-0 h-[22%]"
            style={{
              background:
                "linear-gradient(180deg,rgba(120,118,125,0) 0%,rgba(120,118,125,.28) 40%,rgba(120,118,125,.42) 70%,rgba(120,118,125,.2) 100%)",
              filter: "blur(28px)",
            }}
          />
          <div
            className="absolute top-[64%] right-0 bottom-0 left-0"
            style={{
              background:
                "linear-gradient(180deg,rgba(214,214,218,0) 0%,rgba(214,214,218,.55) 30%,rgba(190,192,200,.7) 100%)",
            }}
          />
          <div
            className="absolute top-[56%] left-[-10%] h-[30%] w-[40%]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%,rgba(96,96,104,.5),rgba(96,96,104,0) 70%)",
              filter: "blur(30px)",
            }}
          />
          <div
            className="absolute top-[40%] right-[-8%] h-[36%] w-[36%]"
            style={{
              background:
                "radial-gradient(ellipse at 60% 100%,rgba(88,88,96,.55),rgba(88,88,96,0) 70%)",
              filter: "blur(26px)",
            }}
          />
        </div>

        <header
          data-reveal="nav"
          className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between opacity-0"
          style={{ padding: L.navPad }}
        >
          <Link
            href="/"
            className="font-[family-name:var(--font-instrument-serif)] text-[30px] leading-none tracking-[-0.01em]"
          >
            {brandName}
          </Link>
          <nav
            aria-label="Primary"
            className="gap-[clamp(20px,2.6vw,40px)] font-[family-name:var(--font-instrument-serif)] text-[19px]"
            style={{ display: L.navLinks }}
          >
            <a href="#collections" className="opacity-92 hover:opacity-60">
              Shop
            </a>
            <a href="#" className="opacity-92 hover:opacity-60">
              Occasions
            </a>
            <a href="#" className="opacity-92 hover:opacity-60">
              Subscriptions
            </a>
            <a href="#" className="opacity-92 hover:opacity-60">
              About
            </a>
          </nav>
          <div className="flex items-center gap-[22px]">
            <button
              type="button"
              aria-label="Search"
              className="flex cursor-pointer border-0 bg-transparent p-1 text-inherit"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="8.5" cy="8.5" r="6" />
                <line x1="13" y1="13" x2="18" y2="18" />
              </svg>
            </button>
            <Link
              href="/sign-in"
              aria-label="Account"
              className="flex border-0 bg-transparent p-1 text-inherit"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="10" cy="6.5" r="3.5" />
                <path d="M3 18c1-4 4-5.5 7-5.5s6 1.5 7 5.5" />
              </svg>
            </Link>
            <button
              type="button"
              aria-label={`Shopping bag, ${hydrated ? itemCount : 0} items`}
              onClick={() => setDrawerOpen(true)}
              className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-1 text-[14px] text-inherit"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="3" y="6.5" width="14" height="11" rx="1.5" />
                <path d="M6.5 6.5V5a3.5 3.5 0 0 1 7 0v1.5" />
              </svg>
              <span aria-hidden="true">({hydrated ? itemCount : 0})</span>
            </button>
          </div>
        </header>

        <div
          data-text="1"
          className="pointer-events-none absolute inset-0 z-[5] flex flex-col"
          style={{
            padding: L.textPad,
            justifyContent: L.textJustify,
          }}
        >
          <div className="pointer-events-auto" style={{ maxWidth: L.textMax }}>
            <p
              data-reveal="eyebrow"
              className="m-0 mb-[clamp(18px,2.4vw,34px)] text-[11px] font-medium tracking-[0.32em] uppercase opacity-0"
            >
              Flowers for a brighter tomorrow
            </p>
            <h1
              className="m-0 font-[family-name:var(--font-instrument-serif)] font-normal leading-[0.9] tracking-[-0.025em] text-[#1c1a1a]"
              style={{ fontSize: L.h1 }}
            >
              <span className="block overflow-hidden pb-[0.04em]">
                <span data-reveal="l1" className="block opacity-0">
                  More
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.04em]">
                <span data-reveal="l2" className="block opacity-0">
                  than flowers,
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.08em]">
                <span data-reveal="l3" className="block font-[family-name:var(--font-instrument-serif)] italic opacity-0">
                  moments.
                </span>
              </span>
            </h1>
            <p
              data-reveal="copy"
              className="mt-[clamp(18px,2.4vw,30px)] m-0 max-w-[34ch] font-[family-name:var(--font-instrument-serif)] text-[clamp(18px,1.35vw,22px)] leading-[1.4] opacity-0 text-pretty"
            >
              Thoughtfully curated blooms for life&apos;s most meaningful moments.
            </p>
            <div data-reveal="cta" className="mt-[clamp(26px,3vw,44px)] opacity-0">
              <motion.a
                href="#collections"
                onClick={onCtaClick}
                onHoverStart={() => setCtaHover(true)}
                onHoverEnd={() => setCtaHover(false)}
                whileHover={{ y: -2 }}
                className="inline-flex h-14 items-center gap-[18px] rounded-full bg-[#1c1a1a] px-[34px] text-[11.5px] font-medium tracking-[0.24em] text-[#f4f1ec] uppercase whitespace-nowrap will-change-transform"
                style={{
                  backgroundColor: ctaHover ? "#0d0c0c" : "#1c1a1a",
                  transition: "background-color 250ms ease",
                }}
              >
                <span>Shop collections</span>
                <motion.span
                  aria-hidden="true"
                  animate={{ x: ctaHover ? 5 : 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  →
                </motion.span>
              </motion.a>
            </div>
          </div>
        </div>

        <div
          data-scroll="bouquet"
          className="pointer-events-none absolute will-change-transform"
          style={{
            zIndex: L.bouquetZ,
            right: L.bouquetRight,
            top: L.bouquetTop,
            width: L.bouquetW,
          }}
        >
          <div data-mouse="bouquet" className="will-change-transform">
            <div data-bouquet="1" className="opacity-0 will-change-transform">
              <Image
                src="/hero/bouquet.png"
                alt="A hand-tied bouquet of blush garden roses, peonies and white blossoms"
                width={720}
                height={900}
                priority
                draggable={false}
                className="block h-auto w-full"
                style={{ filter: "drop-shadow(0 30px 40px rgba(60,40,40,.18))" }}
              />
            </div>
          </div>
        </div>

        {petals.map((petal) => (
          <div
            key={petal.id}
            data-scroll={petal.zone}
            data-petal={petal.zone}
            data-o={petal.o}
            data-depth={petal.depth}
            aria-hidden="true"
            style={petal.wrapStyle}
          >
            <div data-mouse={petal.zone} data-depth={petal.depth} className="will-change-transform">
              <div data-drift={petal.zone} data-seed={petal.seed} className="will-change-transform">
                <div role="presentation" style={petal.imgStyle}>
                  <Image
                    src={petal.src}
                    alt=""
                    width={petal.w}
                    height={petal.h}
                    draggable={false}
                    className="block h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <p
          data-reveal="caption"
          aria-label="Beauty in every season"
          className="absolute z-[5] m-0 text-right text-[11px] leading-[1.9] font-medium tracking-[0.3em] text-[#2a2727] uppercase opacity-0 whitespace-nowrap"
          style={{ right: L.capRight, top: L.capTop }}
        >
          Beauty
          <br />
          in every
          <br />
          season
        </p>

        <div
          data-reveal="scroll"
          aria-hidden="true"
          className="absolute z-[5] flex-col items-center gap-[10px] opacity-0"
          style={{
            right: L.scrollRight,
            top: L.scrollTop,
            display: L.scrollDisplay,
          }}
        >
          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full border border-[rgba(28,26,26,.55)] text-[9px] font-medium tracking-[0.3em] uppercase">
            Scroll
          </div>
          <span
            data-dot="1"
            className="florea-dot block h-1 w-1 rounded-full bg-[#1c1a1a] will-change-transform"
          />
        </div>

        <div
          data-reveal="bottom"
          className="absolute z-[5] flex items-center gap-[22px] opacity-0"
          style={{ left: L.bottomLeft, bottom: L.bottomBottom }}
        >
          <span className="font-[family-name:var(--font-instrument-serif)] text-[26px] leading-none text-[#3a3737]">
            01
          </span>
          <span className="block h-px w-[76px] bg-[rgba(28,26,26,.5)]" />
          <span className="text-[10px] leading-[1.9] font-medium tracking-[0.3em] text-[#3a3737] uppercase whitespace-nowrap">
            Bloom a
            <br />
            happier you
          </span>
        </div>
      </section>

      <div
        data-sig="1"
        aria-hidden="true"
        className="pointer-events-none absolute z-[7] w-16 opacity-0 will-change-transform"
        style={{
          left: L.sigLeft,
          top: "calc(.7 * max(100svh, 700px))",
        }}
      >
        <div data-drift="sig" data-seed="41" className="will-change-transform">
          <Image
            src="/hero/petal_01.png"
            alt=""
            width={64}
            height={74}
            draggable={false}
            className="block h-auto w-full"
            style={{
              transform: "rotate(-20deg)",
              filter: "drop-shadow(0 12px 14px rgba(80,40,40,.18))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
