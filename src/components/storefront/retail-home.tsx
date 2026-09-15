import Link from "next/link";

import { ButtonLink, TravelArrow } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StorefrontHeroBlock } from "@/lib/storefront/content-blocks";
import type { StorefrontManifestLocation } from "@/lib/storefront/manifest-types";

export function RetailHome({
  brandName,
  hero,
  locations,
}: {
  brandName: string;
  hero: StorefrontHeroBlock;
  locations: StorefrontManifestLocation[];
}) {
  return (
    <>
      <section className="wrap pt-[clamp(48px,9vw,104px)] pb-[clamp(40px,6vw,72px)]">
        <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div>
            <span className="t-overline tracking-[0.22em] text-muted">{brandName}</span>
            <h1 className="t-display-xl mt-6">{hero.title}</h1>
            <p className="mt-7 max-w-[54ch] text-[clamp(17px,2.2vw,20px)] leading-[1.55] text-mocha">
              {hero.subtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/menu" size="lg" className="group">
                Shop now
                <TravelArrow />
              </ButtonLink>
              <ButtonLink href="/order" variant="secondary" size="lg">
                Order ahead
              </ButtonLink>
            </div>
          </div>

          <Card className="flex min-h-[320px] flex-col justify-end bg-[color-mix(in_oklab,var(--color-accent),white_88%)] lg:min-h-[440px]">
            <p className="t-overline text-muted">Seasonal stems</p>
            <p className="mt-3 font-serif text-[clamp(28px,4vw,40px)] leading-[1.08] tracking-[-0.02em]">
              Arranged with care.
            </p>
          </Card>
        </div>
      </section>

      {locations.length > 0 ? (
        <section className="border-t border-line">
          <div className="wrap py-[clamp(40px,6vw,72px)]">
            <h2 className="t-h1 mb-8">Visit us</h2>
            <ul className="grid gap-5 md:grid-cols-3">
              {locations.map((location) => (
                <li key={location.locationPublicId}>
                  <Link
                    href={`/locations#${location.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-md border border-line bg-surface p-6 transition-[border-color,box-shadow] duration-std ease-brand hover:border-[var(--color-accent)] hover:shadow-md"
                  >
                    <h3 className="t-h2">{location.name}</h3>
                    <span className="mt-auto inline-flex items-center gap-2 text-[13.5px] font-medium">
                      Opening hours
                      <TravelArrow className="text-[var(--color-accent)]" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
