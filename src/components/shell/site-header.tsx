"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/brand/icons";
import { Sheet } from "@/components/ui/sheet";
import { StampProgress } from "@/components/brand/stamp-card";
import { SECONDARY_NAV } from "./nav";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/stores/cart";
import { useQosBasket, selectBasketItemCount } from "@/lib/stores/qos-basket";
import { useLoyalty } from "@/lib/stores/loyalty";
import { useHydrated } from "@/lib/use-hydrated";
import { CustomerAccountMenu } from "@/components/auth/customer-account-menu";
import { LocaleSelector } from "@/components/locale/locale-selector";
import { useStorefrontShell } from "@/lib/stores/storefront-shell";

export function SiteHeader() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hydrated = useHydrated();
  const shell = useStorefrontShell();
  const isHospitality = shell.themePresetId === "hospitality_baseline";
  const isHome = pathname === "/";
  const overlayHome = isHospitality && isHome;

  const setDrawerOpen = useCart((state) => state.setDrawerOpen);
  const itemCount = useQosBasket(selectBasketItemCount);
  const member = useLoyalty((state) => state.member);
  const stamps = useLoyalty((state) => state.stamps);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeNav = () => setNavOpen(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLinks = shell.primaryNav.filter((item) =>
    overlayHome ? item.href !== "/" : true,
  );

  return (
    <>
      <header
        data-nav
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex justify-center px-[clamp(16px,4vw,48px)] transition-[padding] duration-500",
          overlayHome ? "pt-3" : "pt-2",
          scrolled ? "pt-2" : overlayHome ? "pt-[22px]" : "pt-3",
        )}
      >
        <motion.nav
          data-nav-bar
          layout
          aria-label="Primary"
          className={cn(
            "flex w-full max-w-[980px] items-center justify-between gap-3 rounded-pill border px-4 py-1.5 pl-4 transition-[background,backdrop-filter,border-color,max-width] duration-500",
            overlayHome
              ? scrolled
                ? "border-cream/12 bg-[rgba(47,35,34,0.88)] backdrop-blur-[14px]"
                : "border-cream/10 bg-[rgba(74,56,54,0.35)]"
              : isHospitality
                ? scrolled
                  ? "border-cream/12 bg-[rgba(47,35,34,0.88)] backdrop-blur-[14px]"
                  : "border-cream/10 bg-[rgba(47,35,34,0.88)] backdrop-blur-[14px]"
                : scrolled
                  ? "border-line bg-[color-mix(in_oklab,var(--color-cream),transparent_6%)] backdrop-blur-[14px]"
                  : "border-line/80 bg-[color-mix(in_oklab,var(--color-cream),transparent_10%)] backdrop-blur-[10px]",
          )}
        >
          <Link href="/" aria-label={`${shell.brandName} home`} className="inline-flex shrink-0 items-center">
            <Image
              src={isHospitality ? "/assets/logo-cream.png" : shell.logoSrc}
              alt={shell.brandName}
              width={120}
              height={26}
              className="h-[22px] w-auto md:h-[26px]"
              priority
            />
          </Link>

          <div data-nav-links className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-pill px-3.5 py-2 text-[13px] font-medium transition-colors duration-200",
                  isHospitality
                    ? isActive(item.href)
                      ? "bg-cream/10 text-cream"
                      : "text-cream/80 hover:bg-cream/8 hover:text-cream"
                    : isActive(item.href)
                      ? "bg-latte-50 text-fg"
                      : "text-muted hover:bg-latte-50 hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {overlayHome ? (
              <Link
                href="/order"
                className="inline-flex min-h-11 items-center rounded-pill bg-cream px-5 text-[13px] font-semibold text-espresso no-tap-highlight transition-colors hover:bg-latte active:scale-[0.97]"
              >
                Order Now
              </Link>
            ) : (
              <>
                {isHospitality ? (
                  <Link
                    href="/loyalty"
                    className="hidden items-center gap-2 rounded-pill px-3 py-2 text-[13px] text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream md:inline-flex"
                  >
                    <Image src="/assets/bean.png" alt="" width={12} height={12} className="h-3 w-3" />
                    Bean card
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label={`Open bag, ${itemCount} items`}
                  className={cn(
                    "relative inline-flex min-h-11 items-center gap-2 rounded-pill px-3.5 text-[13px] font-semibold no-tap-highlight transition-colors",
                    isHospitality
                      ? "bg-cream text-espresso hover:bg-latte"
                      : "bg-espresso text-cream hover:bg-mocha",
                  )}
                >
                  <Icon name="bag" className="h-4 w-4" strokeWidth={1.8} />
                  <span className="hidden sm:inline">Bag</span>
                  <span
                    className={cn(
                      "grid h-5 min-w-5 place-items-center rounded-full px-1 font-mono text-[10px] tabular-nums",
                      hydrated && itemCount > 0
                        ? "bg-latte text-espresso"
                        : isHospitality
                          ? "bg-espresso/10 text-espresso/70"
                          : "bg-cream/15 text-cream/70",
                    )}
                  >
                    {hydrated ? itemCount : 0}
                  </span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
              aria-expanded={navOpen}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-pill border no-tap-highlight transition-colors md:hidden",
                isHospitality
                  ? "border-cream/20 text-cream hover:bg-cream/8"
                  : "border-line text-espresso hover:bg-latte-50",
              )}
            >
              <Icon name="menu" className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>
        </motion.nav>
      </header>

      <Sheet
        open={navOpen}
        onClose={() => setNavOpen(false)}
        side="bottom"
        title={shell.brandName}
        description={shell.footerStatement}
        footer={
          <div className="flex flex-col gap-3">
            {shell.localeSelectorEnabled ? <LocaleSelector /> : null}
            <CustomerAccountMenu compact returnTo="/checkout" onNavigate={closeNav} />
            {hydrated && member ? (
              <StampProgress stamps={stamps} />
            ) : isHospitality ? (
              <p className="t-caption">Join the bean card — eight cups, one free coffee.</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {SECONDARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeNav}
                  className="t-overline rounded-pill border border-line px-3 py-2 text-[10px] text-muted transition-colors duration-fast hover:border-latte hover:text-fg"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        }
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {shell.primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeNav}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-4 border-b border-line py-4 transition-colors duration-fast ease-brand last:border-b-0",
                isActive(item.href) ? "text-fg" : "text-mocha hover:text-fg",
              )}
            >
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-md border",
                  isActive(item.href)
                    ? "border-espresso bg-espresso text-cream"
                    : "border-line bg-surface",
                )}
              >
                <Icon name={item.icon} className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-medium">{item.label}</span>
                {item.hint ? <span className="t-caption block">{item.hint}</span> : null}
              </span>
              <Icon name="arrow" className="ml-auto h-4 w-4 shrink-0 text-latte" strokeWidth={2} />
            </Link>
          ))}
        </nav>
      </Sheet>
    </>
  );
}
