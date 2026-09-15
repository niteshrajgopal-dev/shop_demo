"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bean, BeanDivider } from "@/components/brand/bean";
import { Mark, MarkDivider } from "@/components/brand/mark";
import { Icon } from "@/components/brand/icons";
import { SOCIALS } from "@/lib/fixtures/quotes-design-reference/brand";
import { SECONDARY_NAV } from "./nav";
import { useStorefrontShell } from "@/lib/stores/storefront-shell";

export function SiteFooter() {
  const pathname = usePathname();
  const shell = useStorefrontShell();
  const isHospitality = shell.themePresetId === "hospitality_baseline";

  if (isHospitality && pathname === "/") {
    return null;
  }

  const BrandMark = isHospitality ? Bean : Mark;
  const BrandDivider = isHospitality ? BeanDivider : MarkDivider;

  return (
    <footer className="mt-2 bg-espresso text-cream">
      <div className="wrap flex flex-col gap-12 py-[clamp(56px,8vw,96px)] pb-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3.5">
            <BrandMark onDark className="w-6" />
            <span className="font-serif text-[26px] text-cream">{shell.brandName}</span>
          </div>
          <p className="max-w-[20ch] font-serif text-[clamp(22px,3.4vw,34px)] leading-tight text-cream">
            {shell.footerStatement}
          </p>
        </div>

        <div
          className={
            isHospitality
              ? "grid gap-10 border-t border-[var(--border-on-dark)] pt-10 sm:grid-cols-2 lg:grid-cols-4"
              : "grid gap-10 border-t border-[var(--border-on-dark)] pt-10 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          <nav aria-label="Footer — shop">
            <h2 className="t-overline mb-4 text-latte">Explore</h2>
            <ul className="flex flex-col gap-2.5">
              {shell.primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-cream/70 transition-colors duration-fast ease-brand hover:text-cream"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer — locations">
            <h2 className="t-overline mb-4 text-latte">Locations</h2>
            <ul className="flex flex-col gap-3">
              {shell.locations.map((location) => (
                <li key={location.locationPublicId}>
                  <Link
                    href={`/locations#${location.slug}`}
                    className="group block text-[14px] text-cream/70 transition-colors duration-fast ease-brand hover:text-cream"
                  >
                    {location.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {isHospitality ? (
            <div>
              <h2 className="t-overline mb-4 text-latte">Follow &amp; connect</h2>
              <ul className="flex flex-col gap-2.5">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      className="group inline-flex items-baseline gap-2 text-[14px] text-cream/70 transition-colors duration-fast ease-brand hover:text-cream"
                      rel="noreferrer noopener"
                    >
                      {social.label}
                      <span className="font-mono text-[11px] tracking-[0.06em] text-cream/45">
                        {social.handle}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {isHospitality ? (
            <div>
              <h2 className="t-overline mb-4 text-latte">System</h2>
              <ul className="flex flex-col gap-2.5">
                {SECONDARY_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[14px] text-cream/70 transition-colors duration-fast ease-brand hover:text-cream"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <BrandDivider className="opacity-80" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="t-caption text-cream/55">
            {shell.brandName} · served from {shell.hostname}
          </p>
          <p className="t-caption text-cream/45">
            <Icon
              name={isHospitality ? "bean" : "flower"}
              className="mr-1 inline h-3 w-3 opacity-60"
            />
            QOS storefront renderer
          </p>
        </div>
      </div>
    </footer>
  );
}
