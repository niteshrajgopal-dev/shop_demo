"use client";

import { usePathname } from "next/navigation";

import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";
import { MobileTabBar } from "@/components/shell/mobile-tab-bar";
import { CartDrawer } from "@/components/shell/cart-drawer";
import { useStorefrontShell } from "@/lib/stores/storefront-shell";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shell = useStorefrontShell();
  const isHome = pathname === "/";
  const isHospitality = shell.themePresetId === "hospitality_baseline";
  const isRetailHome = isHome && !isHospitality;

  return (
    <>
      {isRetailHome ? null : <SiteHeader />}
      <main
        id="main"
        className={
          isRetailHome
            ? ""
            : "pb-[calc(env(safe-area-inset-bottom)+72px)] pt-[88px] md:pb-0 [&:has([data-hero])]:pt-0"
        }
      >
        {children}
      </main>
      {isRetailHome || (isHospitality && isHome) ? null : <SiteFooter />}
      {isRetailHome ? null : <MobileTabBar />}
      <CartDrawer />
    </>
  );
}
