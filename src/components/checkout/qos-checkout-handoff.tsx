"use client";

import { useEffect, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card, Notice } from "@/components/ui/card";
import { buildSignInHref } from "@/lib/auth/customer-auth-client";
import { startCheckoutFromBasket } from "@/lib/qos/checkout-handoff-client";
import { QosRequestError } from "@/lib/qos/api-client";
import {
  selectCustomerDisplayName,
  selectCustomerSignedIn,
  useCustomerSession,
} from "@/lib/stores/customer-session";
import { useQosBasket } from "@/lib/stores/qos-basket";

export function QosCheckoutHandoff() {
  const basket = useQosBasket((state) => state.basket);
  const hydrate = useQosBasket((state) => state.hydrate);
  const signedIn = useCustomerSession(selectCustomerSignedIn);
  const displayName = useCustomerSession(selectCustomerDisplayName);
  const sessionStatus = useCustomerSession((state) => state.status);
  const refreshCustomer = useCustomerSession((state) => state.refresh);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastReference, setLastReference] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        await hydrate();
        await refreshCustomer();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [hydrate, refreshCustomer]);

  async function onStartCheckout() {
    if (!basket || basket.lines.length === 0) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const paymentAttempt = await startCheckoutFromBasket(basket.version);
      setLastReference(paymentAttempt.paymentAttemptPublicId);

      if (!paymentAttempt.handoff.url) {
        throw new Error("QOS did not return a checkout handoff URL.");
      }

      window.location.assign(paymentAttempt.handoff.url);
    } catch (handoffError) {
      if (
        handoffError instanceof QosRequestError &&
        (handoffError.statusCode === 401 || handoffError.field === "emailVerified")
      ) {
        await refreshCustomer();
        setError(
          handoffError.field === "emailVerified"
            ? "Verify your email before starting sandbox checkout."
            : "Sign in with your customer account to start sandbox checkout.",
        );
      } else {
        setError(
          handoffError instanceof Error
            ? handoffError.message
            : "Unable to start sandbox checkout.",
        );
      }
      setBusy(false);
    }
  }

  const canCheckout = signedIn && basket && basket.lines.length > 0;
  const checking = loading || sessionStatus === "loading";

  return (
    <Card className="flex flex-col gap-4 border-dashed">
      <div className="flex flex-col gap-2">
        <p className="t-overline text-muted">QOS sandbox checkout</p>
        <h2 className="t-label">Backend-verified test payment</h2>
        <p className="text-[14px] text-muted">
          Starts a checkout quote from your current QOS basket and hands off to Stripe
          sandbox. Success is only confirmed after QOS verifies the payment outcome.
        </p>
      </div>

      {checking ? (
        <p className="text-[14px] text-muted">Checking QOS checkout readiness…</p>
      ) : null}

      {!checking && !signedIn ? (
        <Notice tone="info" title="Customer sign-in required">
          Checkout is tied to your verified QOS customer session.
          <div className="mt-3">
            <ButtonLink href={buildSignInHref("/checkout")} size="sm">
              Sign in to continue
            </ButtonLink>
          </div>
        </Notice>
      ) : null}

      {!checking && signedIn ? (
        <Notice tone="info">
          Signed in as <span className="font-medium text-fg">{displayName}</span>.
        </Notice>
      ) : null}

      {basket ? (
        <p className="font-mono text-[12px] text-muted">
          Basket {basket.basketPublicId} · {basket.itemCount} item
          {basket.itemCount === 1 ? "" : "s"} · v{basket.version}
        </p>
      ) : null}

      {lastReference ? (
        <p className="font-mono text-[12px] text-muted">
          Last payment attempt: {lastReference}
        </p>
      ) : null}

      {error ? (
        <Notice tone="error" title="Sandbox checkout unavailable">
          {error}
        </Notice>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="lg"
          loading={busy}
          loadingLabel="Starting checkout…"
          disabled={checking || !canCheckout || Boolean(error)}
          onClick={() => void onStartCheckout()}
        >
          Pay with Stripe sandbox
        </Button>
        {signedIn ? (
          <ButtonLink href="/checkout/success" variant="secondary" size="lg">
            Open success recovery
          </ButtonLink>
        ) : null}
      </div>
    </Card>
  );
}
