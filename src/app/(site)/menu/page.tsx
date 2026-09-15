import type { Metadata } from "next";
import { Mark } from "@/components/brand/mark";
import { ButtonLink, TravelArrow } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MenuBoard } from "@/components/menu/menu-board";
import { MenuContextNotice, MenuUnavailable } from "@/components/menu/menu-status";
import { getServerStorefrontLocale } from "@/lib/locale/locale.server";
import { loadPublishedMenu } from "@/lib/qos/menu.server";
import { resolveStorefrontContextFromHeaders } from "@/lib/storefront/context.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: "Published flower shop catalogue from QOS with approved translations and AED pricing.",
};

export default async function MenuPage() {
  const context = await resolveStorefrontContextFromHeaders();
  const locale = await getServerStorefrontLocale();
  const menuResult = await loadPublishedMenu(locale);

  return (
    <>
      <section className="wrap pt-[clamp(40px,7vw,80px)] pb-[clamp(28px,4vw,48px)]">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-14">
          <div>
            <span className="t-overline inline-flex items-center gap-2.5 tracking-[0.22em] text-muted">
              <Mark className="w-[0.9em]" />
              Shop
            </span>
            <h1 className="t-display-l mt-5 max-w-[20ch]">Everything in the shop today.</h1>
            <p className="mt-6 max-w-[56ch] text-[clamp(17px,2.2vw,20px)] leading-[1.55] text-mocha">
              This catalogue is loaded from the published QOS release for the selected branch.
              Prices and availability come from the backend, not a local copy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/order" size="lg" className="group">
                Order ahead
                <TravelArrow />
              </ButtonLink>
              <ButtonLink href="/locations" variant="secondary" size="lg">
                Find a shop
              </ButtonLink>
            </div>
          </div>

          <Card className="flex flex-col gap-4">
            <h2 className="t-label">Published menu source</h2>
            {menuResult.status === "ok" ? (
              <>
                <dl className="grid gap-2 text-[13.5px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Branch</dt>
                    <dd className="font-medium">{menuResult.branchName}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Menu</dt>
                    <dd className="font-medium">{menuResult.menu.displayName}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Release</dt>
                    <dd className="font-mono">{menuResult.menu.releaseVersion}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Locale</dt>
                    <dd className="font-mono uppercase">{menuResult.menu.locale}</dd>
                  </div>
                </dl>
                <p className="t-caption border-t border-line pt-3">
                  Modifier customisation returns when QOS modifier groups are published for this menu.
                </p>
              </>
            ) : (
              <p className="text-[13.5px] text-muted">{menuResult.error}</p>
            )}
          </Card>
        </div>
      </section>

      <section className="wrap pb-[clamp(48px,7vw,88px)]">
        {menuResult.status === "ok" ? (
          <div className="flex flex-col gap-6">
            <MenuContextNotice
              branchName={menuResult.branchName}
              menuDisplayName={menuResult.menu.displayName}
              releaseVersion={menuResult.menu.releaseVersion}
              locale={menuResult.menu.locale}
              currency={menuResult.menu.currency}
            />
            <MenuBoard menu={menuResult.menu} />
          </div>
        ) : (
          <MenuUnavailable result={menuResult} />
        )}
      </section>

      <section className="border-t border-line">
        <div className="wrap py-[clamp(40px,6vw,72px)]">
          <h2 className="t-h1 mb-8">Where to collect</h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {context.manifest.locations.map((location) => (
              <li key={location.locationPublicId}>
                <Card className="flex h-full flex-col gap-3">
                  <h3 className="t-h2">{location.name}</h3>
                  <p className="t-caption">
                    Branch configured in the published storefront release.
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
