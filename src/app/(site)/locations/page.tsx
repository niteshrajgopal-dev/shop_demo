import type { Metadata } from "next";

import { Mark } from "@/components/brand/mark";
import { ButtonLink, TravelArrow } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/brand/icons";
import { resolveStorefrontContextFromHeaders } from "@/lib/storefront/context.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const context = await resolveStorefrontContextFromHeaders();
  return {
    title: "Locations",
    description: `Branches configured for ${context.brandName}.`,
  };
}

export default async function LocationsPage() {
  const context = await resolveStorefrontContextFromHeaders();

  return (
    <>
      <section className="wrap pt-[clamp(40px,7vw,80px)] pb-[clamp(32px,5vw,56px)]">
        <span className="t-overline inline-flex items-center gap-2.5 tracking-[0.22em] text-muted">
          <Mark className="w-[0.9em]" />
          Our locations
        </span>
        <h1 className="t-display-l mt-5 max-w-[18ch]">Where to collect.</h1>
        <p className="mt-6 max-w-[56ch] text-[clamp(17px,2.2vw,20px)] leading-[1.55] text-mocha">
          Branches are loaded from the published storefront release for {context.brandName}.
        </p>
      </section>

      <section className="wrap pb-[clamp(48px,7vw,88px)]">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {context.manifest.locations.map((location) => (
            <li key={location.locationPublicId} id={location.slug} className="scroll-mt-24">
              <Card className="flex h-full flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <Icon name="location" className="h-5 w-5 text-latte" strokeWidth={1.7} />
                  <span className="font-mono text-[11px] tracking-[0.08em] text-muted uppercase">
                    {location.locationPublicId}
                  </span>
                </div>
                <h2 className="t-h1">{location.name}</h2>
                <p className="text-[14.5px] leading-relaxed text-mocha">
                  Published branch linked to the active menu release.
                </p>
                <div className="mt-auto flex flex-wrap gap-3 border-t border-line pt-4">
                  <ButtonLink href="/menu" size="md" className="group">
                    Shop
                    <TravelArrow />
                  </ButtonLink>
                  <ButtonLink href="/order" variant="secondary" size="md">
                    Order ahead
                  </ButtonLink>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
