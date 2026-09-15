"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/brand/mark";
import { Icon } from "@/components/brand/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Notice } from "@/components/ui/card";
import { Stepper } from "@/components/ui/tabs";
import { MenuBoard } from "@/components/menu/menu-board";
import { MenuUnavailable } from "@/components/menu/menu-status";
import type { MenuLoadResult } from "@/lib/qos/menu-types";
import { QosCartLineRow } from "@/components/cart/qos-cart-line-row";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCart } from "@/lib/stores/cart";
import { useQosBasket, selectBasketItemCount } from "@/lib/stores/qos-basket";
import { formatMoneyMinor } from "@/lib/qos/money";
import { useHydrated } from "@/lib/use-hydrated";
import { useStorefrontShell } from "@/lib/stores/storefront-shell";
import { cn } from "@/lib/cn";

const STEPS = ["Where", "Shop", "Bag"] as const;

export function OrderFlow({ menuResult }: { menuResult: MenuLoadResult }) {
  const router = useRouter();
  const shell = useStorefrontShell();
  const hydrated = useHydrated();
  const [step, setStep] = useState(0);

  const basket = useQosBasket((state) => state.basket);
  const itemCount = useQosBasket(selectBasketItemCount);
  const locationId = useCart((state) => state.locationId);
  const setLocation = useCart((state) => state.setLocation);

  const chosenLocation = shell.locations.find(
    (location) => location.locationPublicId === locationId,
  );

  const canLeaveWhere = Boolean(chosenLocation);
  const canLeaveMenu = itemCount > 0;

  const advance = () => {
    if (step === STEPS.length - 1) {
      router.push("/checkout");
      return;
    }

    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hydrated) {
    return (
      <div className="flex items-center gap-3 py-16 text-muted">
        <Mark className="w-5 animate-mark-spin" />
        <span className="text-[14px]">Loading your bag…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Stepper steps={[...STEPS]} current={step} onStepSelect={(index) => setStep(index)} />

      {step === 0 ? (
        <section aria-label="Choose a shop" className="flex flex-col gap-6">
          <h2 className="t-h1">Which shop?</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {shell.locations.map((location) => {
              const selected = locationId === location.locationPublicId;
              return (
                <li key={location.locationPublicId}>
                  <button
                    type="button"
                    onClick={() => setLocation(location.locationPublicId)}
                    aria-pressed={selected}
                    className={cn(
                      "flex h-full w-full flex-col gap-3 rounded-md border p-5 text-left",
                      "transition-[border-color,background-color,box-shadow] duration-std ease-brand",
                      selected
                        ? "border-espresso bg-espresso text-cream shadow-md"
                        : "border-line bg-surface hover:border-latte",
                    )}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <Icon
                        name="location"
                        className="h-5 w-5 text-latte"
                        strokeWidth={1.7}
                      />
                      <span
                        className={cn(
                          "font-mono text-[11px] tracking-[0.08em] uppercase",
                          selected ? "text-latte" : "text-muted",
                        )}
                      >
                        Branch
                      </span>
                    </span>
                    <span className={cn("font-serif text-[20px]", selected && "text-cream")}>
                      {location.name}
                    </span>
                    <span
                      className={cn(
                        "text-[13px] leading-relaxed",
                        selected ? "text-cream/65" : "text-muted",
                      )}
                    >
                      Published branch from the storefront release.
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {chosenLocation ? (
            <Notice tone="success" title={`${chosenLocation.name}.`}>
              Your basket and checkout will use this branch.
            </Notice>
          ) : (
            <Notice tone="info">Pick a branch to continue with the published shop menu.</Notice>
          )}
        </section>
      ) : null}

      {step === 1 ? (
        <section aria-label="Choose your flowers" className="flex flex-col gap-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="t-h1">What would you like?</h2>
            {chosenLocation ? (
              <Badge tone="neutral">
                <Icon name="location" className="h-3 w-3" strokeWidth={2} />
                {chosenLocation.name}
              </Badge>
            ) : null}
          </div>
          {menuResult.status === "ok" ? (
            <MenuBoard menu={menuResult.menu} openBagOnAdd />
          ) : (
            <MenuUnavailable result={menuResult} />
          )}
        </section>
      ) : null}

      {step === 2 ? (
        <section aria-label="Review your bag" className="flex flex-col gap-6">
          <h2 className="t-h1">Your bag</h2>
          {!basket || basket.lines.length === 0 ? (
            <EmptyState
              title="Nothing in the bag"
              body="Go back a step and pick something from the shop."
              action={
                <Button variant="secondary" size="sm" onClick={goBack}>
                  Back to the shop
                </Button>
              }
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
              <ul className="flex flex-col border-t border-line">
                {basket.lines.map((line) => (
                  <QosCartLineRow
                    key={line.linePublicId}
                    line={line}
                    currency={basket.currency}
                    locale={basket.locale}
                  />
                ))}
              </ul>
              <Card className="flex h-fit flex-col gap-5">
                <h3 className="t-label">Summary</h3>
                <OrderSummary />
                <Button size="md" onClick={() => router.push("/checkout")}>
                  Continue to checkout
                </Button>
              </Card>
            </div>
          )}
        </section>
      ) : null}

      {step < STEPS.length - 1 ? (
        <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+68px)] z-40 -mx-[var(--mx)] border-t border-line bg-[color-mix(in_oklab,var(--color-cream),transparent_4%)] px-[var(--mx)] py-3 backdrop-blur-[10px] md:bottom-4 md:mx-0 md:rounded-md md:border md:px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="t-label">
                {itemCount > 0
                  ? `${itemCount} item${itemCount === 1 ? "" : "s"}`
                  : "Empty bag"}
              </p>
              <p className="font-mono text-[16px] tabular-nums">
                {basket
                  ? formatMoneyMinor(
                      basket.provisionalSubtotalMinor,
                      basket.currency,
                      basket.locale,
                    )
                  : formatMoneyMinor(0, "AED", "en")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {step > 0 ? (
                <Button variant="secondary" size="md" onClick={goBack}>
                  Back
                </Button>
              ) : null}
              <Button
                size="md"
                onClick={advance}
                disabled={step === 0 ? !canLeaveWhere : !canLeaveMenu}
              >
                {step === 0 ? "Choose flowers" : step === 1 ? "Review bag" : "Checkout"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
