"use client";

import { heroLayout } from "@/components/hero/layout";
import { useBreakpoint } from "@/components/hero/useBreakpoint";

const collections = [
  { name: "The Garden Edit", from: "From $85", slot: "collection photo — blush roses" },
  { name: "Quiet Whites", from: "From $95", slot: "collection photo — white blooms" },
  { name: "Seasonal Stems", from: "From $65", slot: "collection photo — mixed stems" },
];

export function Collections() {
  const bp = useBreakpoint();
  const L = heroLayout(bp);

  return (
    <section
      id="collections"
      className="relative z-[1] min-h-svh bg-[#f4f1ed] text-[#1c1a1a]"
      style={{ padding: L.colPad }}
    >
      <p className="m-0 mb-5 text-[11px] font-medium tracking-[0.32em] text-[#5c5757] uppercase">
        The collections
      </p>
      <h2 className="m-0 max-w-[14ch] font-[family-name:var(--font-instrument-serif)] text-[clamp(44px,5.6vw,92px)] leading-[0.95] font-normal tracking-[-0.02em] text-pretty">
        Arrangements for <em className="italic">every</em> season.
      </h2>
      <div className="mt-[clamp(48px,6vw,96px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-7">
        {collections.map((collection) => (
          <a key={collection.name} href="#" className="block text-inherit">
            <div className="flex aspect-[3/4] items-end rounded-[2px] bg-[repeating-linear-gradient(135deg,#e6e0da_0_10px,#ece7e1_10px_20px)] p-[18px] font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-[#6b6563]">
              {collection.slot}
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-[family-name:var(--font-instrument-serif)] text-2xl">{collection.name}</span>
              <span className="text-[11px] tracking-[0.2em] text-[#5c5757] uppercase">{collection.from}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
