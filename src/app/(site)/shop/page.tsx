import type { Metadata } from "next";
import { HospitalityPageIntro } from "@/components/hospitality/page-intro";
import { ShopGrid } from "@/components/product/shop-grid";
import { Plate } from "@/components/ui/plate";
import { SectionHead } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Coffee",
  description:
    "Single origins and blends, roasted in small batches in Ancoats and posted the next morning.",
};

export default function ShopPage() {
  return (
    <>
      <HospitalityPageIntro
        kicker="Shop"
        title="Six coffees, honestly described."
        lead="Everything here was roasted this week in Ancoats. Tasting notes are what we actually taste on the cupping table, not what reads well on a bag."
      />

      <section className="wrap pb-[clamp(48px,7vw,88px)]">
        <ShopGrid />
      </section>

      <section className="border-t border-line">
        <div className="wrap py-[clamp(52px,7vw,92px)]">
          <SectionHead
            index="—"
            title="How we roast"
            sub="Two roast days a week, on a 15kg drum, profiled per lot rather than per bag size."
          />
          <div className="grid gap-5 md:grid-cols-3">
            <Plate
              tone="origin"
              kicker="Tuesday · light"
              caption="Single origins profiled to keep acidity and florals intact."
              className="min-h-[240px]"
            />
            <Plate
              tone="espresso"
              kicker="Friday · dark"
              caption="Blends developed longer for body under milk."
              className="min-h-[240px]"
            />
            <Plate
              tone="paper"
              kicker="Same week · posted"
              caption="Bagged with a one-way valve, tracked 24-hour, degassed on arrival."
              className="min-h-[240px]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
