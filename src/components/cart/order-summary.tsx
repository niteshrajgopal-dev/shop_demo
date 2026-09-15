"use client";

import { Mark } from "@/components/brand/mark";
import { Notice } from "@/components/ui/card";
import { formatMoneyMinor } from "@/lib/qos/money";
import { useQosBasket } from "@/lib/stores/qos-basket";
import { cn } from "@/lib/cn";

/** Authoritative basket totals from QOS. */
export function OrderSummary() {
  const basket = useQosBasket((state) => state.basket);
  const signedIn = useQosBasket((state) => state.signedIn);
  const error = useQosBasket((state) => state.error);

  if (!basket || basket.itemCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <Notice tone="info">
        {signedIn
          ? "Totals come from your signed-in QOS basket."
          : "Totals come from your server basket. Sign in before checkout to pay."}
      </Notice>

      {error ? (
        <Notice tone="error" title="Basket update issue">
          {error}
        </Notice>
      ) : null}

      <dl className="flex flex-col gap-2.5 text-[14px]">
        <Row
          label="Subtotal"
          value={formatMoneyMinor(
            basket.provisionalSubtotalMinor,
            basket.currency,
            basket.locale,
          )}
        />
        <div className="mt-1 flex items-baseline justify-between border-t border-line pt-3.5">
          <dt className="font-serif text-[19px]">Total</dt>
          <dd className="font-mono text-[19px] tabular-nums">
            {formatMoneyMinor(
              basket.provisionalSubtotalMinor,
              basket.currency,
              basket.locale,
            )}
          </dd>
        </div>
      </dl>

      <p className="t-caption flex items-center gap-2">
        <Mark className="w-3" />
        Basket version {basket.version} · {basket.ownership} · release{" "}
        {basket.menuReleaseVersion}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("font-mono tabular-nums", accent ? "text-success" : "text-fg")}>{value}</dd>
    </div>
  );
}
