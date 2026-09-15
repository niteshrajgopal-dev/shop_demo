import Link from "next/link";

import { Collections } from "@/components/Collections";
import { HospitalityLanding } from "@/components/home/hospitality-landing";
import { Hero } from "@/components/hero/Hero";
import { TravelArrow } from "@/components/ui/button";
import { resolveHeroContentBlock } from "@/lib/storefront/content-blocks";
import { resolveStorefrontContextFromHeaders } from "@/lib/storefront/context.server";
import { getServerStorefrontLocale } from "@/lib/locale/locale.server";
import type { StorefrontManifestLocation } from "@/lib/storefront/manifest-types";
import { loadPublishedMenu } from "@/lib/qos/menu.server";

export const dynamic = "force-dynamic";

function HomeLocations({ locations }: { locations: StorefrontManifestLocation[] }) {
  if (locations.length === 0) return null;

  return (
    <section className="border-t border-[rgba(28,26,26,.12)] bg-[#f4f1ed]">
      <div className="wrap py-[clamp(40px,6vw,72px)]">
        <h2 className="t-h1 mb-8 font-[family-name:var(--font-instrument-serif)] text-[#1c1a1a]">Visit us</h2>
        <ul className="grid gap-5 md:grid-cols-3">
          {locations.map((location) => (
            <li key={location.locationPublicId}>
              <Link
                href={`/locations#${location.slug}`}
                className="group flex h-full flex-col gap-3 rounded-md border border-[rgba(28,26,26,.12)] bg-[#faf8f5] p-6 transition-[border-color,box-shadow] duration-std ease-brand hover:border-[#1c1a1a] hover:shadow-md"
              >
                <h3 className="t-h2 font-[family-name:var(--font-instrument-serif)] text-[#1c1a1a]">
                  {location.name}
                </h3>
                <span className="mt-auto inline-flex items-center gap-2 text-[13.5px] font-medium text-[#1c1a1a]">
                  Opening hours
                  <TravelArrow className="text-[#1c1a1a]" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const context = await resolveStorefrontContextFromHeaders();
  const locale = await getServerStorefrontLocale();
  const hero = resolveHeroContentBlock(
    context.themePreset.id,
    context.manifest.contentBlocks,
    locale,
  );

  if (context.themePreset.id === "generic_retail_baseline") {
    return (
      <>
        <Hero brandName={context.brandName} />
        <Collections />
        <HomeLocations locations={context.manifest.locations} />
      </>
    );
  }

  const menuResult = await loadPublishedMenu(locale);
  const menuProducts =
    menuResult.status === "ok"
      ? menuResult.menu.sections.flatMap((section) => section.products)
      : [];

  return (
    <HospitalityLanding
      brandName={context.brandName}
      heroTitle={hero?.title ?? "Coffee worth quoting."}
      heroSubtitle={
        hero?.subtitle ??
        "Crafted with character. Made for moments worth remembering."
      }
      locale={locale}
      menuProducts={menuProducts}
      locations={context.manifest.locations}
    />
  );
}
