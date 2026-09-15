"use client";

import Link from "next/link";
import { Mark } from "@/components/brand/mark";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { QosCartLineRow } from "@/components/cart/qos-cart-line-row";
import { OrderSummary } from "@/components/cart/order-summary";
import { QosCheckoutHandoff } from "@/components/checkout/qos-checkout-handoff";
import { useQosBasket, selectBasketItemCount } from "@/lib/stores/qos-basket";
import { useHydrated } from "@/lib/use-hydrated";

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const basket = useQosBasket((state) => state.basket);
  const itemCount = useQosBasket(selectBasketItemCount);

  return (
    <section className="wrap pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,7vw,88px)]">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-muted uppercase">
          <li>
            <Link href="/menu" className="transition-colors duration-fast hover:text-fg">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-fg">Checkout</li>
        </ol>
      </nav>

      <header className="mb-9 flex flex-col gap-4">
        <span className="t-overline inline-flex items-center gap-2.5 tracking-[0.22em] text-muted">
          <Mark className="w-[0.9em]" />
          Checkout
        </span>
        <h1 className="t-display-m">One last look.</h1>
      </header>

      {!hydrated ? (
        <div className="flex items-center gap-3 py-16 text-muted">
          <Mark className="w-5 animate-Mark-spin" />
          <span className="text-[14px]">Loading your bag…</span>
        </div>
      ) : itemCount === 0 || !basket ? (
        <EmptyState
          title="Your bag is empty"
          body="Add something from the published shop menu, then come back here."
          action={
            <ButtonLink href="/menu" size="sm">
              Shop
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-8">
            <QosCheckoutHandoff />
          </div>

          <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:h-fit">
            <Card className="flex flex-col gap-5">
              <h2 className="t-label">Your QOS basket</h2>
              <ul className="flex flex-col border-t border-line">
                {basket.lines.map((line) => (
                  <QosCartLineRow
                    key={line.linePublicId}
                    line={line}
                    currency={basket.currency}
                    locale={basket.locale}
                    compact
                  />
                ))}
              </ul>
              <OrderSummary />
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}
