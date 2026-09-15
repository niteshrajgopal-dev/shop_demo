"use client";

import type { ReactNode } from "react";

import { Mark } from "@/components/brand/mark";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, Notice } from "@/components/ui/card";
import { formatMoneyMinor } from "@/lib/qos/money";
import type { CheckoutPaymentOutcomeResponse } from "@/lib/qos/types";
import { useStorefrontLocale } from "@/lib/stores/storefront-locale";

function badgeToneForStatus(
  status: CheckoutPaymentOutcomeResponse["status"],
): BadgeTone {
  switch (status) {
    case "succeeded":
      return "success";
    case "failed":
      return "error";
    case "cancelled":
    case "expired":
      return "warning";
    default:
      return "info";
  }
}

function statusLabel(status: CheckoutPaymentOutcomeResponse["status"]) {
  switch (status) {
    case "succeeded":
      return "Payment confirmed";
    case "failed":
      return "Payment declined";
    case "cancelled":
      return "Checkout cancelled";
    case "expired":
      return "Session expired";
    case "unknown":
      return "Confirmation pending";
    default:
      return "Payment in progress";
  }
}

export function CheckoutOutcomePanel({
  outcome,
  polling,
  onRefresh,
}: {
  outcome: CheckoutPaymentOutcomeResponse;
  polling: boolean;
  onRefresh: () => void;
}) {
  const locale = useStorefrontLocale((state) => state.locale);

  const showRetry =
    outcome.status === "failed" ||
    outcome.status === "cancelled" ||
    outcome.status === "expired";

  return (
    <div className="flex flex-col gap-5">
      <Badge tone={badgeToneForStatus(outcome.status)}>
        {statusLabel(outcome.status)}
      </Badge>

      <h1 className="t-display-m max-w-[28ch]">
        {locale === "ar" ? outcome.messaging.titleAr : outcome.messaging.titleEn}
      </h1>
      <p className="max-w-[52ch] text-[16px] leading-relaxed text-mocha">
        {locale === "ar" ? outcome.messaging.bodyAr : outcome.messaging.bodyEn}
      </p>

      {outcome.diagnostics?.isLabelledFixture ? (
        <Notice tone="info" title="Fixture mode.">
          This outcome came from a labelled development fixture, not a live Stripe sandbox
          charge.
        </Notice>
      ) : null}

      {polling ? (
        <Notice tone="info">
          <span className="inline-flex items-center gap-2">
            <Mark className="w-4 animate-mark-spin" />
            Confirming your sandbox payment with QOS…
          </span>
        </Notice>
      ) : null}

      {!polling &&
      (outcome.status === "unknown" ||
        outcome.status === "pending" ||
        outcome.status === "provider_handoff") ? (
        <Notice tone="info" title="Still pending.">
          We have not received a final payment outcome yet. Refresh to check again without
          starting a new payment.
          <button
            type="button"
            onClick={onRefresh}
            className="ml-2 font-medium underline underline-offset-2"
          >
            Refresh status
          </button>
        </Notice>
      ) : null}

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
        <div className="flex flex-col gap-6">
          <Card className="p-0">
            <dl className="grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <dt className="t-label mb-2">Payment reference</dt>
                <dd className="ltr-isolate font-mono text-[18px] break-all">
                  {outcome.paymentAttemptPublicId}
                </dd>
              </div>
              {outcome.providerReference ? (
                <div>
                  <dt className="t-label mb-2">Stripe session</dt>
                  <dd className="font-mono text-[14px] break-all text-muted">
                    {outcome.providerReference}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="t-label mb-2">Total</dt>
                <dd className="ltr-isolate font-mono text-[18px]">
                  {formatMoneyMinor(outcome.totalMinor, outcome.currency, locale)}
                </dd>
              </div>
              <div>
                <dt className="t-label mb-2">Quote</dt>
                <dd className="font-mono text-[14px] break-all text-muted">
                  {outcome.quotePublicId}
                </dd>
              </div>
            </dl>
          </Card>

          <div>
            <h2 className="t-label mb-3">What you ordered</h2>
            <ul className="flex flex-col border-t border-line">
              {outcome.lines.map((line) => (
                <li
                  key={line.linePublicId}
                  className="flex items-start justify-between gap-4 border-b border-line py-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-medium leading-snug">
                      {line.displayNameEn}
                    </p>
                    <p className="t-caption ltr-isolate mt-0.5 font-mono">
                      {line.quantity} ×{" "}
                      {formatMoneyMinor(
                        line.unitPrice.amountMinor,
                        outcome.currency,
                        locale,
                      )}
                    </p>
                  </div>
                  <p className="ltr-isolate shrink-0 font-mono text-[13.5px] tabular-nums">
                    {formatMoneyMinor(line.lineTotalMinor, outcome.currency, locale)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Card className="flex flex-col gap-4">
          <h2 className="t-label">Test checkout only</h2>
          <p className="text-[14.5px] leading-relaxed text-mocha">
            No real charge was made and no order will be fulfilled. This screen reflects the
            backend-confirmed sandbox outcome from QOS, not the Stripe redirect alone.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {showRetry ? (
              <ButtonLink href="/checkout" size="sm">
                Try checkout again
              </ButtonLink>
            ) : null}
            <ButtonLink href="/menu" variant="secondary" size="sm">
              Back to menu
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function CheckoutOutcomeLoading({ label }: { label: string }) {
  return (
    <section className="wrap flex items-center gap-3 py-24 text-muted">
      <Mark className="w-5 animate-mark-spin" />
      <span className="text-[14px]">{label}</span>
    </section>
  );
}

export function CheckoutOutcomeEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <section className="wrap py-[clamp(48px,8vw,96px)]">
      <EmptyState title={title} body={body} action={action} />
    </section>
  );
}
