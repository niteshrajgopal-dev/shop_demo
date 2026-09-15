"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Mark } from "@/components/brand/mark";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, Notice } from "@/components/ui/card";
import {
  CheckoutOutcomeLoading,
  CheckoutOutcomePanel,
} from "@/components/checkout/checkout-outcome-panel";
import { useCheckoutOutcome } from "@/lib/qos/use-checkout-outcome";

function CheckoutCancelledWithSession({
  sessionId,
}: {
  sessionId: string;
}) {
  const { state, refresh } = useCheckoutOutcome(sessionId);

  if (state.kind === "loading") {
    return <CheckoutOutcomeLoading label="Checking checkout status with QOS…" />;
  }

  if (state.kind === "outcome") {
    return (
      <section className="wrap pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,7vw,88px)]">
        <CheckoutOutcomePanel
          outcome={state.outcome}
          polling={state.polling}
          onRefresh={() => {
            refresh();
          }}
        />
      </section>
    );
  }

  return <CheckoutCancelledStatic sessionLookupFailed={state.kind === "not_found"} />;
}

function CheckoutCancelledStatic({
  sessionLookupFailed = false,
}: {
  sessionLookupFailed?: boolean;
}) {
  return (
    <section className="wrap pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,7vw,88px)]">
      <div className="flex flex-col gap-5">
        <Badge tone="warning">Checkout not completed</Badge>
        <h1 className="t-display-m max-w-[24ch]">You left before paying.</h1>
        <p className="max-w-[52ch] text-[16px] leading-relaxed text-mocha">
          Your quote remains unpaid unless QOS independently confirms a sandbox payment
          outcome. Returning to checkout reuses your basket — it does not mark anything as
          paid.
        </p>

        <Notice tone="info" title="Sandbox test only.">
          No real charge was made. When Stripe provides a session reference, QOS can confirm
          whether the attempt was cancelled, expired, or still pending.
        </Notice>

        {sessionLookupFailed ? (
          <Notice tone="warning">
            QOS could not find a payment attempt for this session reference.
          </Notice>
        ) : null}

        <Card className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14.5px] leading-relaxed text-mocha">
            Ready to try again? Your basket should still be waiting.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/checkout" size="sm">
              Return to checkout
            </ButtonLink>
            <ButtonLink href="/menu" variant="secondary" size="sm">
              Back to menu
            </ButtonLink>
          </div>
        </Card>
      </div>
    </section>
  );
}

function CheckoutCancelledGate() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id")?.trim();

  if (sessionId) {
    return <CheckoutCancelledWithSession key={sessionId} sessionId={sessionId} />;
  }

  return <CheckoutCancelledStatic />;
}

export default function CheckoutCancelledPage() {
  return (
    <Suspense
      fallback={
        <section className="wrap flex items-center gap-3 py-24 text-muted">
          <Mark className="w-5 animate-mark-spin" />
          <span className="text-[14px]">Loading…</span>
        </section>
      }
    >
      <CheckoutCancelledGate />
    </Suspense>
  );
}
