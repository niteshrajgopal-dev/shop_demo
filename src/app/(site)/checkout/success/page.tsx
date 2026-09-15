"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Mark } from "@/components/brand/mark";
import { ButtonLink } from "@/components/ui/button";
import {
  CheckoutOutcomeEmpty,
  CheckoutOutcomeLoading,
  CheckoutOutcomePanel,
} from "@/components/checkout/checkout-outcome-panel";
import { useCheckoutOutcome } from "@/lib/qos/use-checkout-outcome";

function CheckoutSuccessContent({ sessionId }: { sessionId: string }) {
  const { state, refresh } = useCheckoutOutcome(sessionId);

  if (state.kind === "loading") {
    return (
      <CheckoutOutcomeLoading label="Confirming your sandbox payment with QOS…" />
    );
  }

  if (state.kind === "unauthenticated") {
    return (
      <CheckoutOutcomeEmpty
        title="Sign in to confirm payment"
        body="Checkout outcomes are tied to your signed-in customer account. Sign in with the same account you used to start checkout, then refresh this page."
        action={
          <ButtonLink href="/checkout" size="sm">
            Back to checkout
          </ButtonLink>
        }
      />
    );
  }

  if (state.kind === "not_found") {
    return (
      <CheckoutOutcomeEmpty
        title="Checkout session not found"
        body="QOS could not find a payment attempt for this session. A fabricated session_id or another customer's session cannot produce a paid state."
        action={
          <ButtonLink href="/checkout" size="sm">
            Return to checkout
          </ButtonLink>
        }
      />
    );
  }

  if (state.kind === "misconfigured") {
    return (
      <CheckoutOutcomeEmpty
        title="Checkout confirmation unavailable"
        body="The storefront is not configured to reach the QOS API yet. Contact support if this persists after deployment."
        action={
          <ButtonLink href="/menu" size="sm">
            Back to menu
          </ButtonLink>
        }
      />
    );
  }

  if (state.kind === "error") {
    return (
      <CheckoutOutcomeEmpty
        title="Unable to confirm checkout"
        body={state.message}
        action={
          <ButtonLink href="/checkout" size="sm">
            Return to checkout
          </ButtonLink>
        }
      />
    );
  }

  if (state.kind !== "outcome") {
    return null;
  }

  return (
    <section className="wrap pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,7vw,88px)]">
      <CheckoutOutcomePanel
        outcome={state.outcome}
        polling={state.polling}
        onRefresh={refresh}
      />
    </section>
  );
}

function CheckoutSuccessGate() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id")?.trim();

  if (!sessionId) {
    return (
      <CheckoutOutcomeEmpty
        title="No checkout session to confirm"
        body="Stripe should return a session_id query parameter after checkout. This page never marks an order paid from the URL alone."
        action={
          <ButtonLink href="/checkout" size="sm">
            Return to checkout
          </ButtonLink>
        }
      />
    );
  }

  return <CheckoutSuccessContent key={sessionId} sessionId={sessionId} />;
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="wrap flex items-center gap-3 py-24 text-muted">
          <Mark className="w-5 animate-mark-spin" />
          <span className="text-[14px]">Loading checkout confirmation…</span>
        </section>
      }
    >
      <CheckoutSuccessGate />
    </Suspense>
  );
}
