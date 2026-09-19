"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { FloreaBouquetDialog } from "@/components/florea/florea-bouquet-dialog";
import {
  bouquets,
  bouquetById,
  FLOREA_VIDEO_SRC,
  occasions,
  type BouquetId,
} from "@/components/florea/data";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  FlowerIcon,
  HeartIcon,
  LeafIcon,
  PauseIcon,
  PlayIcon,
} from "@/components/florea/icons";
import { useFloreaReveals } from "@/components/florea/use-florea-reveals";
import { useFloreaVideo } from "@/components/florea/use-florea-video";
import { useCart } from "@/lib/stores/cart";
import { useQosBasket, selectBasketItemCount } from "@/lib/stores/qos-basket";
import { useHydrated } from "@/lib/use-hydrated";

type FloreaLandingProps = {
  brandName: string;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function FloreaLanding({ brandName }: FloreaLandingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const [activeId, setActiveId] = useState<BouquetId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  const hydrated = useHydrated();
  const itemCount = useQosBasket(selectBasketItemCount);
  const setDrawerOpen = useCart((state) => state.setDrawerOpen);

  const showVideo = !reducedMotion;
  const videoRef = useFloreaVideo({ paused, showVideo });
  useFloreaReveals(rootRef, reducedMotion);

  const openDialog = useCallback((id: BouquetId) => {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    setActiveId(id);
    setMenuOpen(false);
  }, []);

  const closeDialog = useCallback(() => {
    setActiveId(null);
    window.setTimeout(() => lastFocusRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (activeId) closeDialog();
      else if (menuOpen) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeId, menuOpen, closeDialog]);

  const toggleMenu = () => {
    setMenuOpen((open) => {
      const next = !open;
      if (next) {
        window.setTimeout(() => {
          const firstLink = menuRef.current?.querySelector("a");
          firstLink?.focus();
        }, 30);
      }
      return next;
    });
  };

  const activeBouquet = bouquetById(activeId);
  const year = new Date().getFullYear();

  return (
    <div
      ref={rootRef}
      data-paused={paused ? "true" : undefined}
      className="overflow-x-clip bg-[#F8F5EF] font-[family-name:var(--font-inter)] text-[16px] leading-[1.6] text-[#25241F]"
    >
      <header className="absolute top-0 right-0 left-0 z-20 flex h-[88px] items-center justify-between px-[6%] min-[901px]:h-[110px] min-[901px]:px-[5.6%]">
        <a href="#top" className="flex flex-col leading-none">
          <span className="font-[family-name:var(--font-instrument-serif)] text-[34px] tracking-[-0.01em]">
            {brandName}
          </span>
          <span className="mt-1.5 text-[9px] font-medium tracking-[0.32em] text-[#777269] uppercase">
            Flowers &amp; Feelings
          </span>
        </a>

        <nav
          aria-label="Primary"
          className="hidden gap-10 text-[14px] font-medium whitespace-nowrap min-[901px]:flex"
        >
          <a href="#collection" className="px-0 py-1.5 whitespace-nowrap transition-colors duration-[250ms] hover:text-[#525F47]">
            The collection
          </a>
          <a href="#story" className="px-0 py-1.5 whitespace-nowrap transition-colors duration-[250ms] hover:text-[#525F47]">
            Our story
          </a>
          <a href="#occasions" className="px-0 py-1.5 whitespace-nowrap transition-colors duration-[250ms] hover:text-[#525F47]">
            Every occasion
          </a>
        </nav>

        <div className="flex items-center gap-[22px]">
          <a
            href="#collection"
            className="hidden items-center gap-1.5 border-b border-[#C9C4B8] pb-[3px] text-[14px] font-medium whitespace-nowrap transition-colors duration-[250ms] hover:text-[#525F47] min-[901px]:inline-flex"
          >
            Send flowers
            <ArrowUpRight size={12} />
          </a>
          <Link
            href="/sign-in"
            aria-label="Account"
            className="hidden border-0 bg-transparent p-1 text-inherit min-[901px]:inline-flex"
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
            className="hidden cursor-pointer items-center gap-2 border-0 bg-transparent p-1 text-[14px] text-inherit min-[901px]:inline-flex"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="6.5" width="14" height="11" rx="1.5" />
              <path d="M6.5 6.5V5a3.5 3.5 0 0 1 7 0v1.5" />
            </svg>
            <span aria-hidden="true">({hydrated ? itemCount : 0})</span>
          </button>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
            className="inline-flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[3px] border border-[#D8D3C8] bg-transparent p-0 min-[901px]:hidden"
          >
            <span className="block h-px w-[18px] bg-[#25241F]" />
            <span className="block h-px w-[18px] bg-[#25241F]" />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div
          ref={menuRef}
          role="dialog"
          aria-label="Menu"
          className="absolute top-[88px] right-0 left-0 z-30 border-t border-b border-[#E6E1D6] bg-[#FFFDF8] px-[6%] py-5 min-[901px]:hidden"
        >
          <a
            href="#collection"
            onClick={() => setMenuOpen(false)}
            className="block border-b border-[#EEE9DE] py-3.5 font-[family-name:var(--font-instrument-serif)] text-[32px]"
          >
            The collection
          </a>
          <a
            href="#story"
            onClick={() => setMenuOpen(false)}
            className="block border-b border-[#EEE9DE] py-3.5 font-[family-name:var(--font-instrument-serif)] text-[32px]"
          >
            Our story
          </a>
          <a
            href="#occasions"
            onClick={() => setMenuOpen(false)}
            className="block py-3.5 font-[family-name:var(--font-instrument-serif)] text-[32px]"
          >
            Every occasion
          </a>
        </div>
      ) : null}

      <section
        id="top"
        className="relative min-h-svh overflow-hidden bg-[#F8F5EF] min-[901px]:min-h-screen"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 top-[58%] overflow-hidden min-[901px]:top-[300px]"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg,#F8F5EF 0%,#E7E7D9 35%,#A9B394 70%,#7D8A6A 100%)",
            }}
          />
          {showVideo ? (
            <video
              ref={videoRef}
              muted
              autoPlay
              playsInline
              preload="auto"
              src={FLOREA_VIDEO_SRC}
              className="absolute inset-0 h-full w-full object-cover opacity-0 saturate-[0.55]"
            />
          ) : null}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg,#F8F5EF 0%,rgba(248,245,239,.85) 18%,rgba(248,245,239,0) 55%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg,rgba(248,245,239,.9) 0%,rgba(248,245,239,.55) 32%,rgba(248,245,239,0) 62%)",
            }}
          />
        </div>

        <div className="relative z-[2] max-w-[680px] px-[6%] pt-[130px] pb-[200px] min-[901px]:px-0 min-[901px]:pt-[194px] min-[901px]:pb-[240px] min-[901px]:pl-[8%]">
          <p className="florea-rise m-0 mb-[26px] text-[11px] font-medium tracking-[0.22em] text-[#777269] uppercase">
            Nature&apos;s way of saying it
          </p>
          <h1
            className="florea-rise florea-rise-delay-1 m-0 font-[family-name:var(--font-instrument-serif)] text-[clamp(56px,14.5vw,80px)] leading-[0.96] font-normal tracking-[-0.037em] text-[#25241F] min-[901px]:text-[clamp(78px,7.9vw,125px)]"
          >
            Flowers for
            <br />
            moments words
            <br />
            <em className="font-[family-name:var(--font-instrument-serif)] text-[#78816A] italic">
              cannot hold.
            </em>
          </h1>
          <p className="florea-rise florea-rise-delay-2 m-0 mt-[34px] max-w-[440px] text-[16px] leading-[1.65] text-[#4E4B44]">
            For the grand gestures. The quiet thank-yous.
            <br className="hidden min-[901px]:block" />
            And all the beautiful moments in between.
          </p>
          <div className="florea-rise florea-rise-delay-3 mt-[38px]">
            <a
              href="#collection"
              className="inline-flex min-h-[44px] items-center gap-2.5 rounded-[3px] bg-[#525F47] px-[26px] py-4 text-[14px] font-medium text-[#FFFDF8] transition-colors duration-[250ms] hover:bg-[#3E4C33]"
            >
              Explore the collection
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        <div className="absolute right-[6%] bottom-24 z-[2] flex items-center gap-4 min-[901px]:right-[5.6%] min-[901px]:bottom-[120px]">
          <span className="block h-px w-11 bg-[#25241F] opacity-60" />
          <p className="m-0 text-[11px] leading-[1.8] font-medium tracking-[0.22em] text-[#25241F] uppercase whitespace-nowrap">
            A little wild.
            <br />
            A lot of feeling.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 left-0 z-[2] flex h-[78px] items-center justify-between border-t border-[rgba(37,36,31,0.12)] px-[6%] min-[901px]:px-[5.6%]">
          <a
            href="#collection"
            className="inline-flex min-h-[44px] items-center gap-3 text-[13px] font-medium transition-colors duration-[250ms] hover:text-[#525F47]"
          >
            <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#25241F]">
              <ArrowDown />
            </span>
            A world in bloom
          </a>
          <p className="m-0 hidden text-[11px] font-medium tracking-[0.22em] text-[#25241F] uppercase min-[901px]:block">
            The Floréa Collection — 01
          </p>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-[3px] border border-[#25241F] bg-transparent px-3.5 text-[11px] font-medium tracking-[0.18em] text-[#25241F] uppercase"
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </section>

      <div className="flex flex-col items-start justify-around gap-4 border-b border-[#E3DFD3] bg-[#F0EEE5] px-[6%] py-[22px] min-[901px]:flex-row min-[901px]:items-center min-[901px]:gap-6 min-[901px]:px-[6.3%]">
        <div className="flex items-center gap-3 text-[13px] font-medium text-[#4E4B44]">
          <FlowerIcon />
          Thoughtfully arranged
        </div>
        <div className="flex items-center gap-3 text-[13px] font-medium text-[#4E4B44]">
          <LeafIcon />
          Led by the seasons
        </div>
        <div className="flex items-center gap-3 text-[13px] font-medium text-[#4E4B44]">
          <HeartIcon />
          Made to mean something
        </div>
      </div>

      <section id="collection" className="bg-[#F8F5EF] px-[6%] py-[72px] min-[901px]:px-[6.3%] min-[901px]:py-[100px]">
        <div
          data-reveal
          className="mb-14 flex flex-col items-start justify-between gap-8 min-[901px]:mb-14 min-[901px]:flex-row min-[901px]:items-end"
        >
          <div>
            <p className="m-0 mb-5 text-[11px] font-medium tracking-[0.22em] text-[#777269] uppercase">
              Fresh feelings, in flower form
            </p>
            <h2 className="m-0 font-[family-name:var(--font-instrument-serif)] text-[clamp(39px,9.5vw,50px)] leading-[1.02] font-normal tracking-[-0.02em] text-[#25241F] min-[901px]:text-[clamp(46px,4vw,60px)]">
              Meet your next <em className="text-[#78816A] italic">lovely gesture.</em>
            </h2>
          </div>
          <p className="m-0 text-left text-[15px] leading-[1.6] text-[#777269] min-[901px]:text-right">
            A few of our favourite ways
            <br />
            to make someone&apos;s day.
          </p>
        </div>

        <div data-reveal className="grid grid-cols-1 gap-[25px] min-[901px]:grid-cols-3">
          {bouquets.map((bouquet) => (
            <article key={bouquet.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => openDialog(bouquet.id)}
                aria-label={`View ${bouquet.name}`}
                className="group relative block h-[440px] w-full cursor-pointer overflow-hidden border-0 p-0 text-left font-[family-name:var(--font-inter)] text-[#25241F]"
                style={{ backgroundColor: bouquet.bg }}
              >
                <Image
                  src={bouquet.img}
                  alt={bouquet.alt}
                  width={400}
                  height={500}
                  className="absolute inset-x-7 inset-y-9 h-[calc(100%-72px)] w-[calc(100%-56px)] object-contain transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.07] group-hover:rotate-[2deg]"
                />
                <span className="absolute top-[18px] left-5 text-[10px] font-medium tracking-[0.22em] text-[#4E4B44] uppercase">
                  {bouquet.label}
                </span>
                <span className="absolute bottom-4 left-5 font-[family-name:var(--font-instrument-serif)] text-[18px] text-[#4E4B44]">
                  {bouquet.num}
                </span>
                <span className="absolute right-4 bottom-3.5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#25241F] bg-[rgba(255,253,248,0.5)]">
                  <ArrowUpRight size={13} />
                </span>
              </button>
              <h3 className="mt-[22px] mb-1 font-[family-name:var(--font-instrument-serif)] text-[30px] leading-[1.1] font-normal tracking-[-0.01em]">
                {bouquet.name}
              </h3>
              <p className="m-0 mb-2 text-[10px] font-medium tracking-[0.2em] text-[#777269] uppercase">
                Seasonal arrangement
              </p>
              <p className="m-0 text-[14px] text-[#777269]">{bouquet.flowers}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="story"
        className="border-t border-b border-[#EEE9DE] bg-[#FFFDF8] px-[6%] py-[72px] min-[901px]:px-[6.3%] min-[901px]:py-[100px]"
      >
        <div
          data-reveal
          className="grid grid-cols-1 items-center gap-12 min-[901px]:grid-cols-2 min-[901px]:gap-[8%]"
        >
          <div>
            <div className="relative h-[620px] overflow-hidden bg-[#E9EBE1]">
              <div className="absolute -top-[6%] -left-[10%] h-[112%] w-[120%] -rotate-[9deg] scale-[1.15]">
                <Image
                  src="/florea/ivory.png"
                  alt="Close view of the Quiet Poetry bouquet"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className="object-cover object-[50%_30%]"
                />
              </div>
            </div>
            <p className="mt-4 mb-0 text-[11px] font-medium tracking-[0.2em] text-[#777269] uppercase">
              A little closer to nature.
            </p>
          </div>
          <div className="max-w-[520px]">
            <p className="m-0 mb-5 text-[11px] font-medium tracking-[0.22em] text-[#777269] uppercase">
              The heart of Floréa
            </p>
            <h2 className="m-0 mb-8 font-[family-name:var(--font-instrument-serif)] text-[clamp(39px,9.5vw,50px)] leading-[1.02] font-normal tracking-[-0.02em] min-[901px]:text-[clamp(46px,4vw,60px)]">
              Never just flowers.
              <br />
              <em className="text-[#78816A] italic">Always a feeling.</em>
            </h2>
            <p className="m-0 mb-5 text-[17px] leading-[1.6] text-[#25241F]">
              Some things are hard to put into words.
              <br />
              That&apos;s where flowers come in.
            </p>
            <p className="m-0 mb-8 text-[16px] leading-[1.7] text-[#777269]">
              We bring together beautiful stems, unexpected textures and a little of nature&apos;s
              wildness. Thoughtful arrangements that feel personal, because the best gifts say
              something only you could say.
            </p>
            <a
              href="#occasions"
              className="inline-flex min-h-8 items-center gap-2 border-b border-[#25241F] pb-[3px] text-[14px] font-medium transition-colors duration-[250ms] hover:text-[#525F47]"
            >
              Find your moment
              <ArrowRight />
            </a>
          </div>
        </div>
      </section>

      <section id="occasions" className="bg-[#F1EEE6] px-[6%] py-[72px] min-[901px]:px-[6.3%] min-[901px]:py-[100px]">
        <div data-reveal className="mb-12">
          <p className="m-0 mb-5 text-[11px] font-medium tracking-[0.22em] text-[#777269] uppercase">
            Life happens. Send flowers.
          </p>
          <h2 className="m-0 font-[family-name:var(--font-instrument-serif)] text-[clamp(39px,9.5vw,50px)] leading-[1.02] font-normal tracking-[-0.02em] min-[901px]:text-[clamp(46px,4vw,60px)]">
            For every kind of <em className="text-[#78816A] italic">moment.</em>
          </h2>
        </div>
        <div data-reveal className="border-t border-[#D9D4C8]">
          {occasions.map((occasion) => (
            <button
              key={occasion.num}
              type="button"
              onClick={() => openDialog(occasion.id)}
              className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-2 border-0 border-b border-[#D9D4C8] bg-transparent py-[30px] text-left font-[family-name:var(--font-inter)] text-[#25241F] transition-colors duration-[250ms] hover:text-[#525F47] min-[901px]:grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)_44px] min-[901px]:gap-x-6"
            >
              <span className="text-[12px] font-medium tracking-[0.15em] text-[#777269]">
                {occasion.num}
              </span>
              <span className="font-[family-name:var(--font-instrument-serif)] text-[clamp(28px,2.6vw,40px)] leading-[1.1] tracking-[-0.01em]">
                {occasion.title}
              </span>
              <span className="col-start-2 text-[15px] text-[#777269] min-[901px]:col-start-auto min-[901px]:text-right">
                {occasion.text}
              </span>
              <span className="inline-flex h-11 w-11 items-center justify-center justify-self-end">
                <ArrowUpRight size={16} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-[#F3EAE3] px-[6%] py-[100px] text-center min-[901px]:px-[6.3%] min-[901px]:py-[140px]">
        <div data-reveal className="mx-auto flex max-w-[820px] flex-col items-center">
          <p className="m-0 mb-6 text-[11px] font-medium tracking-[0.22em] text-[#777269] uppercase">
            A small gesture. A beautiful feeling.
          </p>
          <h2 className="m-0 mb-10 font-[family-name:var(--font-instrument-serif)] text-[clamp(39px,9.5vw,50px)] leading-[1.02] font-normal tracking-[-0.025em] min-[901px]:text-[clamp(46px,5vw,72px)]">
            Make their day.
            <br />
            <em className="text-[#8C7062] italic">Or make it yours.</em>
          </h2>
          <a
            href="#collection"
            className="inline-flex min-h-[44px] items-center gap-2.5 rounded-[3px] bg-[#525F47] px-[26px] py-4 text-[14px] font-medium text-[#FFFDF8] transition-colors duration-[250ms] hover:bg-[#3E4C33]"
          >
            Send a little happiness
          </a>
        </div>
      </section>

      <footer className="bg-[#F8F5EF] px-[6%] pt-16 pb-9 min-[901px]:px-[6.3%]">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#E3DFD3] pb-8">
          <div>
            <p className="m-0 font-[family-name:var(--font-instrument-serif)] text-[34px] leading-none">
              {brandName}
            </p>
            <p className="mt-2.5 mb-0 text-[14px] text-[#777269]">
              Flowers for the moments that matter.
            </p>
          </div>
          <nav aria-label="Footer" className="flex gap-8 text-[14px] font-medium">
            <a href="#collection" className="transition-colors duration-[250ms] hover:text-[#525F47]">
              The collection
            </a>
            <a href="#story" className="transition-colors duration-[250ms] hover:text-[#525F47]">
              Our story
            </a>
            <a href="#occasions" className="transition-colors duration-[250ms] hover:text-[#525F47]">
              Every occasion
            </a>
          </nav>
        </div>
        <p className="mt-5 mb-0 text-[12px] text-[#777269]">
          © {year} {brandName}. All rights reserved.
        </p>
      </footer>

      {activeBouquet ? <FloreaBouquetDialog bouquet={activeBouquet} onClose={closeDialog} /> : null}
    </div>
  );
}
