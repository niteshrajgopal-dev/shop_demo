"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { buildSignInHref } from "@/lib/auth/customer-auth-client";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, Notice } from "@/components/ui/card";
import { QosCartLineRow } from "@/components/cart/qos-cart-line-row";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCart } from "@/lib/stores/cart";
import { useQosBasket, selectBasketItemCount } from "@/lib/stores/qos-basket";
import { useHydrated } from "@/lib/use-hydrated";

export function CartDrawer() {
  const router = useRouter();
  const hydrated = useHydrated();

  const open = useCart((state) => state.drawerOpen);
  const setDrawerOpen = useCart((state) => state.setDrawerOpen);
  const basket = useQosBasket((state) => state.basket);
  const status = useQosBasket((state) => state.status);
  const error = useQosBasket((state) => state.error);
  const signedIn = useQosBasket((state) => state.signedIn);
  const itemCount = useQosBasket(selectBasketItemCount);
  const hydrate = useQosBasket((state) => state.hydrate);

  useEffect(() => {
    if (open) {
      void hydrate();
    }
  }, [open, hydrate]);

  const close = () => setDrawerOpen(false);

  if (!hydrated) return null;

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Your bag"
      description={
        itemCount > 0
          ? `${itemCount} item${itemCount === 1 ? "" : "s"} · QOS basket`
          : undefined
      }
      footer={
        basket && basket.lines.length > 0 ? (
          <div className="flex flex-col gap-3">
            <OrderSummary />
            <Button
              block
              size="lg"
              onClick={() => {
                close();
                router.push("/checkout");
              }}
            >
              Checkout
            </Button>
            <button
              type="button"
              onClick={close}
              className="min-h-11 rounded-sm text-[13.5px] text-muted transition-colors duration-fast hover:text-fg"
            >
              Keep browsing
            </button>
          </div>
        ) : null
      }
    >
      {status === "loading" ? (
        <p className="text-[14px] text-muted">Loading your QOS basket…</p>
      ) : null}

      {error && !basket ? (
        <Notice tone="error" title="Basket unavailable">
          {error}
        </Notice>
      ) : null}

      {!basket || basket.lines.length === 0 ? (
        <EmptyState
          title="Nothing in the bag yet"
          body="Add something from the published shop menu — it saves to your QOS basket."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ButtonLink href="/menu" variant="secondary" size="sm" onClick={close}>
                Shop
              </ButtonLink>
            </div>
          }
          className="border-none bg-transparent px-0 py-6"
        />
      ) : (
        <div className="flex flex-col gap-5">
          {!signedIn ? (
            <Notice tone="info" title="Sign in before checkout">
              You&apos;re browsing with an anonymous basket. Sign in to pay with your verified
              customer account.
              <div className="mt-3">
                <ButtonLink href={buildSignInHref("/checkout")} size="sm" onClick={close}>
                  Sign in
                </ButtonLink>
              </div>
            </Notice>
          ) : null}
          <ul className="flex flex-col">
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
        </div>
      )}
    </Sheet>
  );
}
