"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/brand/icons";
import { cn } from "@/lib/cn";
import { useQosBasket, selectBasketItemCount } from "@/lib/stores/qos-basket";
import { useHydrated } from "@/lib/use-hydrated";
import { useStorefrontShell } from "@/lib/stores/storefront-shell";

/** Phone-only quick access to the four surfaces used most on a small screen. */
export function MobileTabBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const itemCount = useQosBasket(selectBasketItemCount);
  const shell = useStorefrontShell();
  const isHospitality = shell.themePresetId === "hospitality_baseline";

  return (
    <nav
      aria-label="Quick access"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-[10px] md:hidden",
        isHospitality
          ? "border-cream/12 bg-[rgba(47,35,34,0.92)]"
          : "border-line bg-[color-mix(in_oklab,var(--color-cream),transparent_4%)]",
      )}
    >
      <ul className={cn("grid", isHospitality ? "grid-cols-5" : "grid-cols-4")}>
        {shell.tabNav.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const showBadge =
            hydrated && (item.href === "/order" || item.icon === "bag") && itemCount > 0;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 no-tap-highlight",
                  "transition-colors duration-fast ease-brand",
                  active
                    ? isHospitality
                      ? "text-cream"
                      : "text-fg"
                    : isHospitality
                      ? "text-cream/55"
                      : "text-muted",
                )}
              >
                <span className="relative">
                  <Icon name={item.icon} className="h-[22px] w-[22px]" strokeWidth={active ? 2 : 1.6} />
                  {showBadge ? (
                    <span
                      className={cn(
                        "absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full px-1 font-mono text-[9px] tabular-nums",
                        isHospitality ? "bg-latte text-espresso" : "bg-espresso text-cream",
                      )}
                    >
                      {itemCount}
                    </span>
                  ) : null}
                </span>
                <span className="text-[10.5px] font-medium tracking-[0.02em]">{item.label}</span>
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-[2px] w-8 rounded-full bg-latte"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
